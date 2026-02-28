from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product
from app.services.amazon.keyword_service import get_keywords_for_product

router = APIRouter(prefix="/api/keywords", tags=["Keywords"])

@router.get("/{asin}")
def get_keywords(
    asin: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.asin == asin.upper()).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found. Fetch it first via /api/products/{asin}")
    
    keywords = get_keywords_for_product(product.title, asin)
    
    return {
        "asin": asin,
        "product_title": product.title,
        "keywords": keywords,
        "total": len(keywords)
    }