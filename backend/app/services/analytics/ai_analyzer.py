from typing import Dict, Any

def generate_ai_analysis(product_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI-powered product analysis without external API"""
    
    title = product_data.get("title", "")
    price = product_data.get("current_price", 0) or 0
    bsr = product_data.get("current_bsr", 0) or 0
    rating = product_data.get("current_rating", 0) or 0
    reviews = product_data.get("current_review_count", 0) or 0
    monthly_sales = product_data.get("sales_estimate_monthly", 0) or 0
    revenue = product_data.get("revenue_estimate_monthly", 0) or 0
    score = product_data.get("opportunity_score", 0) or 0
    category = product_data.get("category", "General") or "General"

    # Market Position Analysis
    if bsr <= 1000:
        market_position = "Top Seller"
        position_insight = "This product is in the top 0.1% of Amazon sellers — extremely high demand but very competitive."
    elif bsr <= 5000:
        market_position = "Strong Performer"
        position_insight = "Excellent sales velocity. High competition but proven market demand exists."
    elif bsr <= 20000:
        market_position = "Moderate Performer"
        position_insight = "Solid product with consistent sales. Good entry point for new sellers."
    elif bsr <= 100000:
        market_position = "Niche Product"
        position_insight = "Lower volume niche product. Less competition, but smaller market size."
    else:
        market_position = "Slow Mover"
        position_insight = "Low sales velocity. May have seasonal demand or very specific audience."

    # Review Analysis
    if reviews >= 10000:
        review_barrier = "Very High"
        review_insight = f"With {reviews:,} reviews, breaking in is extremely difficult without significant investment."
    elif reviews >= 1000:
        review_barrier = "High"
        review_insight = f"{reviews:,} reviews creates a significant trust barrier. Budget for review generation strategy."
    elif reviews >= 100:
        review_barrier = "Medium"
        review_insight = f"{reviews:,} reviews is manageable. Focus on getting first 50 reviews quickly."
    else:
        review_barrier = "Low"
        review_insight = f"Only {reviews:,} reviews — great opportunity to compete with fresh listings."

    # Price Analysis
    if price >= 50:
        price_insight = f"At ${price}, higher margins are possible. Customers expect premium quality."
        pricing_strategy = "Premium positioning — invest in quality images and A+ content."
    elif price >= 20:
        price_insight = f"${price} is the sweet spot for Amazon FBA. Good margin potential."
        pricing_strategy = "Competitive pricing — watch BSR changes when adjusting price by ±$2."
    elif price >= 10:
        price_insight = f"${price} is low margin territory after FBA fees. Bundle products to increase AOV."
        pricing_strategy = "Consider bundling 2-3 units or creating a value pack to improve margins."
    else:
        price_insight = f"At ${price}, FBA fees will consume most margin. Evaluate carefully."
        pricing_strategy = "High volume strategy required. Margins are razor thin at this price point."

    # Rating Analysis
    if rating >= 4.5:
        rating_insight = f"⭐ {rating} rating is excellent. Match this quality to compete."
        quality_bar = "Very High"
    elif rating >= 4.0:
        rating_insight = f"⭐ {rating} rating is good. There's room to differentiate with better quality."
        quality_bar = "High"
    elif rating >= 3.5:
        rating_insight = f"⭐ {rating} rating suggests customer dissatisfaction. Opportunity to do it better."
        quality_bar = "Medium — Opportunity to differentiate"
    else:
        rating_insight = f"⭐ {rating} rating is poor. Strong opportunity if you solve the core issues."
        quality_bar = "Low — Big opportunity"

    # Opportunity Assessment
    if score >= 70:
        overall = "🟢 Strong Buy Signal"
        summary = f"This is a promising opportunity in {category}. Strong sales velocity with manageable competition."
        action = "Move forward with supplier sourcing. Test with small initial order."
    elif score >= 50:
        overall = "🟡 Proceed with Caution"
        summary = f"Moderate opportunity in {category}. Profitability is possible but requires careful execution."
        action = "Deep dive into top competitors. Find differentiation angle before investing."
    elif score >= 30:
        overall = "🟠 Challenging Market"
        summary = f"Difficult entry point in {category}. High competition or low demand makes this risky."
        action = "Look for a sub-niche or variation with less competition."
    else:
        overall = "🔴 Not Recommended"
        summary = f"This product in {category} shows unfavorable metrics for new entrants."
        action = "Pass on this product. Reallocate research time to better opportunities."

    # Recommendations
    recommendations = []
    
    if reviews < 50:
        recommendations.append("🚀 Low review count — easier to rank with new listing")
    if rating < 4.0:
        recommendations.append("⭐ Low rating — differentiate with better product quality")
    if bsr > 50000:
        recommendations.append("📦 High BSR — validate demand before large investment")
    if price > 30:
        recommendations.append("💰 Good price point — FBA margins should be healthy")
    if monthly_sales > 500:
        recommendations.append("📈 High sales volume — proven market demand exists")
    if score >= 60:
        recommendations.append("✅ Good opportunity score — worth serious consideration")
    if reviews > 5000 and rating > 4.3:
        recommendations.append("⚠️ Strong incumbent — needs significant differentiation")
    if price < 15:
        recommendations.append("⚠️ Low price point — carefully calculate FBA fees first")

    return {
        "overall_signal": overall,
        "summary": summary,
        "action": action,
        "market_position": market_position,
        "position_insight": position_insight,
        "review_barrier": review_barrier,
        "review_insight": review_insight,
        "price_insight": price_insight,
        "pricing_strategy": pricing_strategy,
        "rating_insight": rating_insight,
        "quality_bar": quality_bar,
        "recommendations": recommendations,
        "metrics_summary": {
            "monthly_revenue": f"${revenue:,.0f}" if revenue else "N/A",
            "monthly_units": f"~{monthly_sales:,}" if monthly_sales else "N/A",
            "opportunity_score": score,
            "market_position": market_position,
        }
    }