from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product, PriceHistory, TrackedProduct
from app.services.amazon.product_scraper import scrape_amazon_product
from app.services.amazon.sales_estimator import estimate_monthly_sales, calculate_opportunity_score

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/{asin}")
def get_product(
    asin: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asin = asin.upper().strip()

    product = db.query(Product).filter(Product.asin == asin).first()
    needs_refresh = True

    if product and product.last_synced_at:
        last_synced = product.last_synced_at
        if last_synced.tzinfo is None:
            last_synced = last_synced.replace(tzinfo=timezone.utc)
        age_hours = (datetime.now(timezone.utc) - last_synced).total_seconds() / 3600
        needs_refresh = age_hours > 6

    if needs_refresh:
        data = scrape_amazon_product(asin)
        if not data:
            raise HTTPException(status_code=404, detail="Product not found on Amazon")

        if not product:
            product = Product(
                asin=asin,
                title=data["title"],
                brand=data["brand"],
                category=data["category"],
                image_url=data["image_url"],
                amazon_url=data["amazon_url"],
                is_prime=data["is_prime"],
            )
            db.add(product)
            db.flush()
        else:
            product.title = data["title"]
            product.brand = data["brand"]

        history = PriceHistory(
            product_id=product.id,
            price=data["price"],
            bsr=data["bsr"],
            rating=data["rating"],
            review_count=data["review_count"],
            in_stock=data["in_stock"],
        )
        db.add(history)

        product.last_synced_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(product)

    history = (
        db.query(PriceHistory)
        .filter(PriceHistory.product_id == product.id)
        .order_by(PriceHistory.recorded_at.desc())
        .limit(90)
        .all()
    )

    latest = history[0] if history else None
    sales_data = estimate_monthly_sales(
        latest.bsr if latest else 0,
        product.category or ""
    )

    opportunity_score = None
    if latest and sales_data["monthly_units"]:
        opportunity_score = calculate_opportunity_score(
            bsr=latest.bsr or 0,
            review_count=latest.review_count or 0,
            monthly_sales=sales_data["monthly_units"],
            seller_count=1
        )

    return {
        "asin": product.asin,
        "title": product.title,
        "brand": product.brand,
        "category": product.category,
        "image_url": product.image_url,
        "amazon_url": product.amazon_url,
        "current_price": float(latest.price) if latest and latest.price else None,
        "current_bsr": latest.bsr if latest else None,
        "current_rating": float(latest.rating) if latest and latest.rating else None,
        "current_review_count": latest.review_count if latest else None,
        "in_stock": latest.in_stock if latest else None,
        "sales_estimate_monthly": sales_data["monthly_units"],
        "revenue_estimate_monthly": round(
            sales_data["monthly_units"] * float(latest.price), 2
        ) if sales_data["monthly_units"] and latest and latest.price else None,
        "opportunity_score": opportunity_score,
        "price_history": [
            {
                "price": float(h.price) if h.price else None,
                "bsr": h.bsr,
                "rating": float(h.rating) if h.rating else None,
                "review_count": h.review_count,
                "recorded_at": h.recorded_at.isoformat()
            }
            for h in reversed(history)
        ],
    }


@router.post("/{asin}/track")
def track_product(
    asin: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asin = asin.upper().strip()
    product = db.query(Product).filter(Product.asin == asin).first()
    if not product:
        raise HTTPException(status_code=404, detail="Fetch product first using GET /api/products/{asin}")

    existing = db.query(TrackedProduct).filter(
        TrackedProduct.user_id == current_user.id,
        TrackedProduct.product_id == product.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already tracking")

    tracked = TrackedProduct(user_id=current_user.id, product_id=product.id)
    db.add(tracked)
    db.commit()
    return {"message": "Product tracked!", "asin": asin}


@router.get("/tracked/list")
def get_tracked(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tracked_list = db.query(TrackedProduct).filter(
        TrackedProduct.user_id == current_user.id
    ).all()

    result = []
    for t in tracked_list:
        product = db.query(Product).filter(Product.id == t.product_id).first()
        if product:
            latest = (
                db.query(PriceHistory)
                .filter(PriceHistory.product_id == product.id)
                .order_by(PriceHistory.recorded_at.desc())
                .first()
            )
            result.append({
                "asin": product.asin,
                "title": product.title,
                "brand": product.brand,
                "image_url": product.image_url,
                "current_price": float(latest.price) if latest and latest.price else None,
                "current_bsr": latest.bsr if latest else None,
                "tracked_at": t.tracked_at.isoformat(),
            })
    return result


@router.delete("/{asin}/track")
def untrack_product(
    asin: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.asin == asin.upper()).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    tracked = db.query(TrackedProduct).filter(
        TrackedProduct.user_id == current_user.id,
        TrackedProduct.product_id == product.id
    ).first()
    if not tracked:
        raise HTTPException(status_code=404, detail="Not tracking this product")

    db.delete(tracked)
    db.commit()
    return {"message": "Untracked successfully"}