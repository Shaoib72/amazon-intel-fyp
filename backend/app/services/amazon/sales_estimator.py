CATEGORY_CURVES = {
    "home": [(1,45000),(100,7000),(1000,1400),(5000,380),(10000,180),(50000,30)],
    "electronics": [(1,30000),(100,4000),(1000,800),(5000,200),(10000,90),(50000,15)],
    "clothing": [(1,60000),(100,8000),(1000,1600),(5000,430),(10000,200),(50000,35)],
    "sports": [(1,25000),(100,3200),(1000,650),(5000,160),(10000,75),(50000,12)],
    "beauty": [(1,50000),(100,7500),(1000,1500),(5000,400),(10000,185),(50000,32)],
    "toys": [(1,35000),(100,5000),(1000,1000),(5000,260),(10000,120),(50000,20)],
    "books": [(1,3000),(100,450),(1000,80),(5000,18),(10000,8)],
    "default": [(1,30000),(100,4200),(1000,850),(5000,215),(10000,100),(50000,17)],
}

def interpolate_sales(bsr: int, curve: list) -> int:
    if bsr <= 0:
        return 0
    curve = sorted(curve, key=lambda x: x[0])
    if bsr <= curve[0][0]:
        return curve[0][1]
    if bsr >= curve[-1][0]:
        return max(0, curve[-1][1])
    for i in range(len(curve) - 1):
        bsr_low, sales_high = curve[i]
        bsr_high, sales_low = curve[i + 1]
        if bsr_low <= bsr <= bsr_high:
            ratio = (bsr - bsr_low) / (bsr_high - bsr_low)
            return max(0, int(sales_high - ratio * (sales_high - sales_low)))
    return 0

def estimate_monthly_sales(bsr: int, category: str) -> dict:
    if not bsr or bsr <= 0:
        return {"monthly_units": None, "confidence": "low"}
    
    category_lower = (category or "").lower()
    curve = CATEGORY_CURVES["default"]
    confidence = "medium"
    
    for key, cat_curve in CATEGORY_CURVES.items():
        if key != "default" and key in category_lower:
            curve = cat_curve
            confidence = "high"
            break
    
    monthly_units = interpolate_sales(bsr, curve)
    return {"monthly_units": monthly_units, "confidence": confidence}

def calculate_opportunity_score(bsr, review_count, monthly_sales, seller_count) -> float:
    score = 0
    
    # Demand (30 pts)
    if monthly_sales >= 3000: score += 30
    elif monthly_sales >= 1500: score += 23
    elif monthly_sales >= 800: score += 17
    elif monthly_sales >= 300: score += 10
    elif monthly_sales >= 100: score += 5
    
    # Low competition reviews (30 pts)
    if review_count < 100: score += 30
    elif review_count < 500: score += 22
    elif review_count < 1000: score += 15
    elif review_count < 3000: score += 8
    elif review_count < 8000: score += 3
    
    # BSR strength (20 pts)
    if bsr < 1000: score += 20
    elif bsr < 5000: score += 15
    elif bsr < 15000: score += 10
    elif bsr < 50000: score += 5
    
    # Seller count (20 pts)
    if seller_count <= 1: score += 20
    elif seller_count <= 3: score += 15
    elif seller_count <= 8: score += 10
    elif seller_count <= 15: score += 5
    
    return round(min(100, score), 1)