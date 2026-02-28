from fastapi import APIRouter, Depends, Query
from app.dependencies import get_current_user
from app.models.user import User
from app.services.analytics.profit_calculator import calculate_profit
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product, PriceHistory

router = APIRouter(prefix="/api/profit", tags=["Profit Calculator"])

@router.get("/calculate")
def profit_calculator(
    selling_price: float = Query(...),
    product_cost: float = Query(...),
    category: str = Query(default="default"),
    weight_lbs: float = Query(default=1.0),
    shipping_to_fba: float = Query(default=2.0),
    current_user: User = Depends(get_current_user)
):
    return calculate_profit(
        selling_price=selling_price,
        product_cost=product_cost,
        category=category,
        weight_lbs=weight_lbs,
        shipping_to_fba=shipping_to_fba,
    )

@router.get("/{asin}")
def profit_for_product(
    asin: str,
    product_cost: float = Query(..., description="Your cost to source the product"),
    weight_lbs: float = Query(default=1.0),
    shipping_to_fba: float = Query(default=2.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.asin == asin.upper()).first()
    if not product:
        return {"error": "Product not found"}
    
    latest = (
        db.query(PriceHistory)
        .filter(PriceHistory.product_id == product.id)
        .order_by(PriceHistory.recorded_at.desc())
        .first()
    )
    
    if not latest or not latest.price:
        return {"error": "No price data available"}
    
    result = calculate_profit(
        selling_price=float(latest.price),
        product_cost=product_cost,
        category=product.category or "default",
        weight_lbs=weight_lbs,
        shipping_to_fba=shipping_to_fba,
    )
    
    result["asin"] = asin
    result["product_title"] = product.title
    return result