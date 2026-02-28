import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from app.config import settings
import re

def scrape_category_bestsellers(category_url: str) -> List[Dict]:
    """Scrape Amazon bestseller list for a category"""
    scraper_url = f"http://api.scraperapi.com"
    params = {
        "api_key": settings.scraper_api_key,
        "url": category_url,
        "country_code": "us",
    }
    
    try:
        response = requests.get(scraper_url, params=params, timeout=60)
        if response.status_code != 200 or len(response.text) < 3000:
            return []
        
        soup = BeautifulSoup(response.text, "html.parser")
        competitors = []
        
        # Find product grid items
        items = soup.find_all("div", {"class": re.compile(r"zg-grid-general-faceout|p13n-sc-uncoverable-faceout")})
        
        for item in items[:10]:
            try:
                # Title
                title_elem = item.find("span", {"class": re.compile(r"a-size-base|zg-text-center-align")})
                title = title_elem.get_text(strip=True) if title_elem else None
                
                # ASIN from link
                link = item.find("a", href=True)
                asin = None
                if link:
                    match = re.search(r"/dp/([A-Z0-9]{10})", link["href"])
                    if match:
                        asin = match.group(1)
                
                # Price
                price = None
                price_elem = item.find("span", {"class": re.compile(r"a-price|p13n-sc-price")})
                if price_elem:
                    try:
                        price_text = price_elem.get_text(strip=True).replace("$", "").replace(",", "")
                        price = float(price_text.split()[0])
                    except:
                        pass
                
                # Rating
                rating = None
                rating_elem = item.find("span", {"class": "a-icon-alt"})
                if rating_elem:
                    try:
                        rating = float(rating_elem.get_text().split()[0])
                    except:
                        pass
                
                if asin and title:
                    competitors.append({
                        "asin": asin,
                        "title": title[:100],
                        "price": price,
                        "rating": rating,
                    })
            except:
                continue
        
        return competitors
    except Exception as e:
        print(f"Competitor scrape error: {e}")
        return []


def get_mock_competitors(asin: str, category: str) -> List[Dict]:
    """Return mock competitors when scraping fails"""
    category_products = {
        "books": [
            {"asin": "B08CMF2CQF", "title": "Clean Code", "price": 35.99, "rating": 4.7, "bsr": 1200, "review_count": 8500},
            {"asin": "B07X9RQ7PL", "title": "The Pragmatic Programmer", "price": 39.99, "rating": 4.6, "bsr": 1800, "review_count": 5200},
            {"asin": "B00B77ER5O", "title": "Code Complete", "price": 42.00, "rating": 4.5, "bsr": 2100, "review_count": 3800},
            {"asin": "B01NAEKSTD", "title": "Design Patterns", "price": 44.99, "rating": 4.4, "bsr": 3500, "review_count": 2900},
            {"asin": "B07FPFL5SG", "title": "Refactoring", "price": 38.00, "rating": 4.5, "bsr": 4200, "review_count": 2100},
        ],
        "electronics": [
            {"asin": "B09B93ZDY4", "title": "Competitor Device A", "price": 49.99, "rating": 4.3, "bsr": 3000, "review_count": 12000},
            {"asin": "B08F7N3T7X", "title": "Competitor Device B", "price": 39.99, "rating": 4.1, "bsr": 5500, "review_count": 8700},
            {"asin": "B07YZB567G", "title": "Competitor Device C", "price": 59.99, "rating": 4.5, "bsr": 2200, "review_count": 15000},
        ],
        "default": [
            {"asin": "B08X1Y2Z3A", "title": "Similar Product A", "price": 24.99, "rating": 4.2, "bsr": 8000, "review_count": 3200},
            {"asin": "B09A2B3C4D", "title": "Similar Product B", "price": 29.99, "rating": 4.4, "bsr": 6500, "review_count": 4800},
            {"asin": "B07E5F6G7H", "title": "Similar Product C", "price": 19.99, "rating": 4.0, "bsr": 12000, "review_count": 1900},
            {"asin": "B08H9I0J1K", "title": "Similar Product D", "price": 34.99, "rating": 4.6, "bsr": 4200, "review_count": 7100},
            {"asin": "B09L2M3N4O", "title": "Similar Product E", "price": 22.99, "rating": 3.9, "bsr": 18000, "review_count": 890},
        ]
    }
    
    cat_lower = (category or "").lower()
    products = category_products.get("default")
    for key in category_products:
        if key in cat_lower:
            products = category_products[key]
            break
    
    # Add market share estimates
    total_sales = sum(max(0, 100000 - p.get("bsr", 50000)) for p in products)
    result = []
    for p in products:
        sales_estimate = max(0, 100000 - p.get("bsr", 50000))
        market_share = round((sales_estimate / total_sales * 100) if total_sales > 0 else 0, 1)
        result.append({**p, "market_share": market_share, "sales_estimate": sales_estimate // 1000})
    
    return result