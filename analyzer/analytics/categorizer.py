import re
from typing import Any, Dict, List, Optional, Tuple

CATEGORY_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "ecommerce_retail": {
        "label": "E-Commerce & Retail",
        "keywords": [
            "product", "item", "order", "delivery", "package", "packaging", "box",
            "amazon", "flipkart", "meesho", "myntra", "seller", "refund", "return",
            "replacement", "price", "quality", "material", "size", "cloth", "shirt",
            "jeans", "shoes", "broken", "damaged", "leaked", "saman", "cheez",
            "kharab", "toota", "seal", "invoice", "courier"
        ],
    },
    "food_dining": {
        "label": "Food & Dining",
        "keywords": [
            "food", "hotel", "restaurant", "swiggy", "zomato", "meal", "dish",
            "taste", "delicious", "tasty", "dinner", "lunch", "breakfast", "chef",
            "waiter", "khana", "zayka", "swad", "piping hot", "beverage", "coffee",
            "tea", "drink", "burger", "pizza", "biryani", "roti", "curry", "snack",
            "sweet", "mithai", "portion", "ambience", "dining"
        ],
    },
    "banking_fintech": {
        "label": "Banking & UPI",
        "keywords": [
            "bank", "banking", "upi", "payment", "transfer", "transaction", "account",
            "atm", "money", "paisa", "paise", "card", "credit", "debit", "loan",
            "interest", "balance", "wallet", "cashback", "paytm", "gpay", "phonepe",
            "statement", "branch", "deposit", "withdrawal", "kyc", "otp", "charges"
        ],
    },
    "travel_transit": {
        "label": "Travel & Transit",
        "keywords": [
            "cab", "driver", "ride", "trip", "ola", "uber", "flight", "airline",
            "train", "bus", "ticket", "seat", "auto", "travel", "journey", "destination",
            "overcharged", "traffic", "metro", "fare", "route", "boarding", "station",
            "airport", "railway"
        ],
    },
    "tech_telecom": {
        "label": "Tech & Telecom",
        "keywords": [
            "wifi", "broadband", "internet", "network", "speed", "signal", "sim",
            "jio", "airtel", "vi", "bsnl", "app", "update", "lag", "battery",
            "phone", "camera", "device", "screen", "software", "server", "crash",
            "bug", "recharge", "connection", "buffering", "disconnect", "hang"
        ],
    },
    "general": {
        "label": "General Service",
        "keywords": [],
    },
}

# Compile regex patterns for fast keyword matching
_CATEGORY_REGEX_MAP = {
    cat_id: [re.compile(r"\b" + re.escape(kw) + r"\b", re.IGNORECASE) for kw in data["keywords"]]
    for cat_id, data in CATEGORY_DEFINITIONS.items()
    if data["keywords"]
}


def detect_category(text: str) -> str:
    """
    Intelligently identify the industry/product category of a review based on domain keywords.
    Returns the category ID (e.g., 'food_dining', 'ecommerce_retail', 'general').
    Deterministic and fast (< 0.1ms).
    """
    if not text or not isinstance(text, str):
        return "general"

    lower_text = text.lower()
    scores: Dict[str, int] = {}

    for cat_id, patterns in _CATEGORY_REGEX_MAP.items():
        score = 0
        for pat in patterns:
            if pat.search(lower_text):
                score += 1
        if score > 0:
            scores[cat_id] = score

    if not scores:
        return "general"

    # Select the category with the highest match score
    best_category = max(scores.items(), key=lambda item: item[1])[0]
    return best_category


def get_category_label(cat_id: str) -> str:
    """Return the human-readable label for a category ID."""
    info = CATEGORY_DEFINITIONS.get(cat_id)
    return info["label"] if info else "General Service"


def get_all_categories() -> List[Dict[str, str]]:
    """Return list of all categories formatted for frontend dropdowns."""
    cats = [{"id": "all", "label": "All Categories"}]
    for cat_id, data in CATEGORY_DEFINITIONS.items():
        cats.append({"id": cat_id, "label": data["label"]})
    return cats
