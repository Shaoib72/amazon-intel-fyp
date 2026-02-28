from typing import Dict

# Amazon FBA fee schedule (approximate)
FBA_FEES = {
    "small_standard": {"weight_limit": 0.75, "fee": 3.22},
    "large_standard_1": {"weight_limit": 1.0, "fee": 4.56},
    "large_standard_2": {"weight_limit": 2.0, "fee": 5.06},
    "large_standard_3": {"weight_limit": 3.0, "fee": 5.56},
    "large_standard_4": {"weight_limit": 21.0, "fee": 8.26},
    "large_bulky": {"weight_limit": 150.0, "fee": 9.73},
}

REFERRAL_FEES = {
    "books": 0.15,
    "electronics": 0.08,
    "clothing": 0.17,
    "home": 0.15,
    "toys": 0.15,
    "sports": 0.15,
    "beauty": 0.08,
    "default": 0.15,
}

def calculate_fba_fee(weight_lbs: float = 1.0) -> float:
    for tier_name, tier in FBA_FEES.items():
        if weight_lbs <= tier["weight_limit"]:
            return tier["fee"]
    return FBA_FEES["large_bulky"]["fee"]

def calculate_referral_fee(price: float, category: str = "default") -> float:
    cat_lower = category.lower() if category else "default"
    rate = REFERRAL_FEES.get("default")
    for key in REFERRAL_FEES:
        if key in cat_lower:
            rate = REFERRAL_FEES[key]
            break
    return round(price * rate, 2)

def calculate_profit(
    selling_price: float,
    product_cost: float,
    category: str = "default",
    weight_lbs: float = 1.0,
    shipping_to_fba: float = 2.0,
    additional_costs: float = 0.0,
) -> Dict:
    if selling_price <= 0:
        return {"error": "Invalid selling price"}
    
    fba_fee = calculate_fba_fee(weight_lbs)
    referral_fee = calculate_referral_fee(selling_price, category)
    closing_fee = 1.80 if category and "book" in category.lower() else 0.0
    
    total_fees = fba_fee + referral_fee + closing_fee
    total_costs = product_cost + shipping_to_fba + additional_costs
    
    gross_profit = selling_price - total_fees - total_costs
    profit_margin = (gross_profit / selling_price * 100) if selling_price > 0 else 0
    roi = (gross_profit / total_costs * 100) if total_costs > 0 else 0
    
    breakeven_price = total_fees + total_costs
    
    return {
        "selling_price": selling_price,
        "product_cost": product_cost,
        "fba_fee": round(fba_fee, 2),
        "referral_fee": round(referral_fee, 2),
        "closing_fee": round(closing_fee, 2),
        "total_fees": round(total_fees, 2),
        "total_costs": round(total_costs + total_fees, 2),
        "gross_profit": round(gross_profit, 2),
        "profit_margin_percent": round(profit_margin, 1),
        "roi_percent": round(roi, 1),
        "breakeven_price": round(breakeven_price, 2),
        "is_profitable": gross_profit > 0,
        "verdict": "✅ Profitable" if gross_profit > 0 and profit_margin >= 20 
                   else "⚠️ Low Margin" if gross_profit > 0 
                   else "❌ Not Profitable"
    }