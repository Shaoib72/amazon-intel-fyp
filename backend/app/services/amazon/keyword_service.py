import requests
from typing import List, Dict
import time

def get_amazon_suggestions(keyword: str) -> List[str]:
    """Get Amazon autocomplete suggestions"""
    try:
        url = "https://completion.amazon.com/api/2017/suggestions"
        params = {
            "word": keyword,
            "marketplace": "US",
            "session-id": "123-1234567-1234567",
            "customer-id": "",
            "request-id": "123456789",
            "page-type": "Gateway",
            "lop": "en_US",
            "site-variant": "desktop",
            "client-info": "amazon-search-ui",
            "mid": "ATVPDKIKX0DER",
            "alias": "aps",
            "b2b": "0",
            "fresh": "0",
            "ks": "80",
            "prefix": keyword,
            "event": "onKeyPress",
            "limit": "11",
            "fb": "1",
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            suggestions = []
            for item in data.get("suggestions", []):
                value = item.get("value", "")
                if value and value != keyword:
                    suggestions.append(value)
            return suggestions[:10]
    except Exception as e:
        print(f"Suggestion error: {e}")
    return []


def estimate_search_volume(keyword: str) -> Dict:
    """Estimate search volume based on keyword characteristics"""
    word_count = len(keyword.split())
    char_count = len(keyword)
    
    # Heuristic scoring
    base_volume = 50000
    
    # Shorter keywords = higher volume
    if word_count == 1:
        volume = base_volume
    elif word_count == 2:
        volume = int(base_volume * 0.4)
    elif word_count == 3:
        volume = int(base_volume * 0.15)
    else:
        volume = int(base_volume * 0.05)
    
    # Competition estimate
    if word_count <= 2:
        competition = "high"
        competition_score = 0.8
    elif word_count == 3:
        competition = "medium"
        competition_score = 0.5
    else:
        competition = "low"
        competition_score = 0.2
    
    is_long_tail = word_count >= 3
    
    return {
        "keyword": keyword,
        "search_volume_estimate": volume,
        "competition": competition,
        "competition_score": competition_score,
        "is_long_tail": is_long_tail,
        "word_count": word_count,
        "opportunity_score": round((1 - competition_score) * (volume / base_volume) * 100, 1)
    }


def get_keywords_for_product(title: str, asin: str) -> List[Dict]:
    """Generate keywords from product title + suggestions"""
    if not title:
        return []
    
    # Extract seed keywords from title
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", 
                  "for", "of", "with", "by", "from", "edition", "version", "2nd",
                  "new", "best", "top", "great", "good", "perfect"}
    
    words = title.lower().split()
    seed_keywords = []
    
    # Single important words
    for word in words:
        clean = word.strip(".,!?()[]")
        if len(clean) > 3 and clean not in stop_words:
            seed_keywords.append(clean)
    
    # 2-word combinations
    for i in range(len(words) - 1):
        w1 = words[i].strip(".,!?()[]")
        w2 = words[i+1].strip(".,!?()[]")
        if w1 not in stop_words and w2 not in stop_words and len(w1) > 2 and len(w2) > 2:
            seed_keywords.append(f"{w1} {w2}")
    
    # Get suggestions for top seeds
    all_keywords = list(set(seed_keywords[:5]))
    
    for seed in seed_keywords[:3]:
        suggestions = get_amazon_suggestions(seed)
        all_keywords.extend(suggestions)
        time.sleep(0.3)
    
    # Score all keywords
    scored = []
    seen = set()
    for kw in all_keywords:
        if kw not in seen and len(kw) > 2:
            seen.add(kw)
            scored.append(estimate_search_volume(kw))
    
    # Sort by opportunity score
    scored.sort(key=lambda x: x["opportunity_score"], reverse=True)
    return scored[:20]