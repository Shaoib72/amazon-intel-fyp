from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product, PriceHistory
from app.services.amazon.competitor_service import get_mock_competitors

router = APIRouter(prefix="/api/competitors", tags=["Competitors"])

@router.get("/{asin}")
def get_competitors(
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
    
    competitors = get_mock_competitors(asin, product.category or "default")
    
    return {
        "asin": asin,
        "product_title": product.title,
        "product_price": float(latest.price) if latest and latest.price else None,
        "product_bsr": latest.bsr if latest else None,
        "product_rating": float(latest.rating) if latest and latest.rating else None,
        "competitors": competitors,
        "total_competitors": len(competitors),
    }