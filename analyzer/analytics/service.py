from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from django.utils import timezone
from django.db.models import Avg, Count, Q

from analyzer.models import AnalysisHistory, BatchAnalysisRecord
from .categorizer import CATEGORY_DEFINITIONS, get_all_categories, get_category_label


def get_cutoff_date(range_str: str) -> Optional[datetime]:
    """Calculate datetime cutoff based on range string (7d, 30d, 90d, all)."""
    now = timezone.now()
    if range_str == "7d":
        return now - timedelta(days=7)
    elif range_str == "30d":
        return now - timedelta(days=30)
    elif range_str == "90d":
        return now - timedelta(days=90)
    return None


def calculate_analytics_trends(
    user: Any,
    date_range: str = "30d",
    category_filter: str = "all",
    source_filter: str = "history",
) -> Dict[str, Any]:
    """
    Generate comprehensive sentiment trend analytics for an authenticated user.
    Strictly aggregates the user's actual search and analysis history (AnalysisHistory).
    No demo or sample data is included.
    """
    cutoff = get_cutoff_date(date_range)

    # 1. Query AnalysisHistory (User's Real Search Queries)
    history_qs = AnalysisHistory.objects.filter(user=user)
    if cutoff:
        history_qs = history_qs.filter(created_at__gte=cutoff)
    if category_filter and category_filter != "all":
        history_qs = history_qs.filter(category=category_filter)

    # Time series date buckets: date_str -> {positive, negative, neutral, mixed, total, conf_sum}
    date_buckets: Dict[str, Dict[str, Any]] = {}
    # Category totals: cat_id -> {positive, negative, neutral, mixed, total, conf_sum}
    category_data: Dict[str, Dict[str, Any]] = {
        cat_id: {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0, "total": 0, "conf_sum": 0.0}
        for cat_id in CATEGORY_DEFINITIONS
    }

    total_reviews = 0
    total_positive = 0
    total_negative = 0
    total_neutral = 0
    total_mixed = 0
    total_conf_sum = 0.0

    # Process User's Single Reviews Search History
    if source_filter in ("all", "history"):
        for item in history_qs:
            dt_str = item.created_at.strftime("%Y-%m-%d")
            sent = item.sentiment.lower()
            cat = item.category if item.category in category_data else "general"
            conf = float(item.confidence)

            total_reviews += 1
            total_conf_sum += conf
            if sent == "positive":
                total_positive += 1
            elif sent == "negative":
                total_negative += 1
            elif sent == "neutral":
                total_neutral += 1
            elif sent == "mixed":
                total_mixed += 1

            # Update date bucket
            if dt_str not in date_buckets:
                date_buckets[dt_str] = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0, "total": 0}
            date_buckets[dt_str]["total"] += 1
            if sent in date_buckets[dt_str]:
                date_buckets[dt_str][sent] += 1

            # Update category data
            category_data[cat]["total"] += 1
            category_data[cat]["conf_sum"] += conf
            if sent in category_data[cat]:
                category_data[cat][sent] += 1

    # Optional: Batch Uploads only if user explicitly filters to batch
    if source_filter in ("batch",):
        batch_qs = BatchAnalysisRecord.objects.filter(user=user)
        if cutoff:
            batch_qs = batch_qs.filter(created_at__gte=cutoff)

        for batch in batch_qs:
            batch_cat_counts = batch.category_counts or {}
            batch_daily = batch.daily_breakdown or {}

            if category_filter and category_filter != "all":
                cat_info = batch_cat_counts.get(category_filter)
                if not cat_info:
                    continue
                b_pos = cat_info.get("positive", 0)
                b_neg = cat_info.get("negative", 0)
                b_neu = cat_info.get("neutral", 0)
                b_mix = cat_info.get("mixed", 0)
                b_total = b_pos + b_neg + b_neu + b_mix
            else:
                b_pos = batch.positive_count
                b_neg = batch.negative_count
                b_neu = batch.neutral_count
                b_mix = batch.mixed_count
                b_total = batch.processed_rows

            if b_total == 0:
                continue

            total_reviews += b_total
            total_positive += b_pos
            total_negative += b_neg
            total_neutral += b_neu
            total_mixed += b_mix
            total_conf_sum += (batch.avg_confidence * b_total)

            for c_id, counts in batch_cat_counts.items():
                target_cat = c_id if c_id in category_data else "general"
                cp = counts.get("positive", 0)
                cn = counts.get("negative", 0)
                cu = counts.get("neutral", 0)
                cm = counts.get("mixed", 0)
                ct = cp + cn + cu + cm
                category_data[target_cat]["total"] += ct
                category_data[target_cat]["positive"] += cp
                category_data[target_cat]["negative"] += cn
                category_data[target_cat]["neutral"] += cu
                category_data[target_cat]["mixed"] += cm
                category_data[target_cat]["conf_sum"] += (batch.avg_confidence * ct)

            if batch_daily:
                for d_str, counts in batch_daily.items():
                    if cutoff:
                        try:
                            d_date = datetime.strptime(d_str, "%Y-%m-%d").date()
                            if d_date < cutoff.date():
                                continue
                        except Exception:
                            pass

                    dp = counts.get("positive", 0)
                    dn = counts.get("negative", 0)
                    du = counts.get("neutral", 0)
                    dm = counts.get("mixed", 0)
                    dt = dp + dn + du + dm

                    if d_str not in date_buckets:
                        date_buckets[d_str] = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0, "total": 0}
                    date_buckets[d_str]["total"] += dt
                    date_buckets[d_str]["positive"] += dp
                    date_buckets[d_str]["negative"] += dn
                    date_buckets[d_str]["neutral"] += du
                    date_buckets[d_str]["mixed"] += dm
            else:
                dt_str = batch.created_at.strftime("%Y-%m-%d")
                if dt_str not in date_buckets:
                    date_buckets[dt_str] = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0, "total": 0}
                date_buckets[dt_str]["total"] += b_total
                date_buckets[dt_str]["positive"] += b_pos
                date_buckets[dt_str]["negative"] += b_neg
                date_buckets[dt_str]["neutral"] += b_neu
                date_buckets[dt_str]["mixed"] += b_mix

    # 3. Calculate Global Summary KPIs
    pos_pct = round((total_positive / total_reviews) * 100, 1) if total_reviews > 0 else 0.0
    neg_pct = round((total_negative / total_reviews) * 100, 1) if total_reviews > 0 else 0.0
    neu_pct = round((total_neutral / total_reviews) * 100, 1) if total_reviews > 0 else 0.0
    mix_pct = round((total_mixed / total_reviews) * 100, 1) if total_reviews > 0 else 0.0
    avg_conf = round(total_conf_sum / total_reviews, 1) if total_reviews > 0 else 0.0
    net_sentiment_score = round(pos_pct - neg_pct, 1)

    summary = {
        "total_reviews": total_reviews,
        "positive_count": total_positive,
        "negative_count": total_negative,
        "neutral_count": total_neutral,
        "mixed_count": total_mixed,
        "positive_pct": pos_pct,
        "negative_pct": neg_pct,
        "neutral_pct": neu_pct,
        "mixed_pct": mix_pct,
        "average_confidence": avg_conf,
        "net_sentiment_score": net_sentiment_score,
    }

    # 4. Format Chronological Time Series
    sorted_dates = sorted(date_buckets.keys())
    time_series: List[Dict[str, Any]] = []

    for d_str in sorted_dates:
        bucket = date_buckets[d_str]
        b_total = bucket["total"]
        b_pos = bucket["positive"]
        b_neg = bucket["negative"]
        b_neu = bucket["neutral"]
        b_mix = bucket["mixed"]

        b_pos_pct = (b_pos / b_total) * 100 if b_total > 0 else 0.0
        b_neg_pct = (b_neg / b_total) * 100 if b_total > 0 else 0.0
        b_nss = round(b_pos_pct - b_neg_pct, 1)

        try:
            parsed_dt = datetime.strptime(d_str, "%Y-%m-%d")
            display_date = parsed_dt.strftime("%b %d")
        except Exception:
            display_date = d_str

        time_series.append({
            "date": d_str,
            "display_date": display_date,
            "total": b_total,
            "positive": b_pos,
            "negative": b_neg,
            "neutral": b_neu,
            "mixed": b_mix,
            "positive_pct": round(b_pos_pct, 1),
            "negative_pct": round(b_neg_pct, 1),
            "net_sentiment": b_nss,
        })

    # 5. Format Category Breakdown
    category_breakdown: List[Dict[str, Any]] = []
    for cat_id, counts in category_data.items():
        c_tot = counts["total"]
        if c_tot == 0:
            continue
        c_pos = counts["positive"]
        c_neg = counts["negative"]
        c_neu = counts["neutral"]
        c_mix = counts["mixed"]
        c_pos_pct = round((c_pos / c_tot) * 100, 1)
        c_neg_pct = round((c_neg / c_tot) * 100, 1)
        c_nss = round(c_pos_pct - c_neg_pct, 1)
        c_conf = round(counts["conf_sum"] / c_tot, 1) if c_tot > 0 else 0.0
        c_vol_share = round((c_tot / total_reviews) * 100, 1) if total_reviews > 0 else 0.0

        category_breakdown.append({
            "id": cat_id,
            "label": get_category_label(cat_id),
            "total": c_tot,
            "volume_share": c_vol_share,
            "positive": c_pos,
            "negative": c_neg,
            "neutral": c_neu,
            "mixed": c_mix,
            "positive_pct": c_pos_pct,
            "negative_pct": c_neg_pct,
            "net_sentiment": c_nss,
            "avg_confidence": c_conf,
        })

    # Sort categories by total volume descending
    category_breakdown.sort(key=lambda x: x["total"], reverse=True)

    # 6. Extract Latest Search Entries for the activity feed
    recent_searches = [
        {
            "id": item.id,
            "text": item.text,
            "sentiment": item.sentiment,
            "confidence": float(item.confidence),
            "category": item.category,
            "category_label": get_category_label(item.category),
            "created_at": item.created_at.strftime("%Y-%m-%d %H:%M"),
            "display_date": item.created_at.strftime("%b %d, %H:%M"),
        }
        for item in history_qs.order_by("-created_at")[:15]
    ]

    batch_count = 0
    if source_filter in ("all", "batch"):
        batch_count = BatchAnalysisRecord.objects.filter(user=user).count()

    return {
        "summary": summary,
        "time_series": time_series,
        "category_breakdown": category_breakdown,
        "recent_searches": recent_searches,
        "available_categories": get_all_categories(),
        "meta": {
            "range": date_range,
            "category": category_filter,
            "source": source_filter,
            "history_count": history_qs.count() if source_filter in ("all", "history") else 0,
            "batch_count": batch_count,
        },
    }
