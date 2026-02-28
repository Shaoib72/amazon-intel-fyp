from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product, PriceHistory
from app.services.analytics.ai_analyzer import generate_ai_analysis
from app.services.amazon.sales_estimator import estimate_monthly_sales, calculate_opportunity_score
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.get("/{asin}/ai")
def get_ai_analysis(
    asin: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.asin == asin.upper()).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found. Fetch it first.")
    
    latest = (
        db.query(PriceHistory)
        .filter(PriceHistory.product_id == product.id)
        .order_by(PriceHistory.recorded_at.desc())
        .first()
    )
    
    sales_data = estimate_monthly_sales(latest.bsr if latest else 0, product.category or "")
    opportunity_score = None
    if latest and sales_data["monthly_units"]:
        opportunity_score = calculate_opportunity_score(
            bsr=latest.bsr or 0,
            review_count=latest.review_count or 0,
            monthly_sales=sales_data["monthly_units"],
            seller_count=1
        )
    
    product_data = {
        "asin": product.asin,
        "title": product.title,
        "category": product.category,
        "current_price": float(latest.price) if latest and latest.price else None,
        "current_bsr": latest.bsr if latest else None,
        "current_rating": float(latest.rating) if latest and latest.rating else None,
        "current_review_count": latest.review_count if latest else None,
        "sales_estimate_monthly": sales_data["monthly_units"],
        "revenue_estimate_monthly": round(sales_data["monthly_units"] * float(latest.price), 2) if sales_data["monthly_units"] and latest and latest.price else None,
        "opportunity_score": opportunity_score,
    }
    
    analysis = generate_ai_analysis(product_data)
    return {"asin": asin, "product_title": product.title, **analysis}


@router.get("/export/csv")
def export_tracked_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.product import TrackedProduct
    
    tracked_list = db.query(TrackedProduct).filter(
        TrackedProduct.user_id == current_user.id
    ).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ASIN", "Title", "Brand", "Category", "Price", "BSR", "Rating", "Reviews", "Tracked At"])
    
    for t in tracked_list:
        product = db.query(Product).filter(Product.id == t.product_id).first()
        if product:
            latest = (
                db.query(PriceHistory)
                .filter(PriceHistory.product_id == product.id)
                .order_by(PriceHistory.recorded_at.desc())
                .first()
            )
            writer.writerow([
                product.asin,
                product.title,
                product.brand or "",
                product.category or "",
                float(latest.price) if latest and latest.price else "",
                latest.bsr if latest else "",
                float(latest.rating) if latest and latest.rating else "",
                latest.review_count if latest else "",
                t.tracked_at.strftime("%Y-%m-%d %H:%M") if t.tracked_at else "",
            ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tracked_products.csv"}
    )