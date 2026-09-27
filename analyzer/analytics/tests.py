from datetime import timedelta
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from analyzer.models import AnalysisHistory, BatchAnalysisRecord
from .categorizer import detect_category, get_all_categories, get_category_label


class AnalyticsCategorizerTests(TestCase):
    """Unit tests for the keyword-driven category classifier."""

    def test_ecommerce_detection(self):
        text = "The product arrived in broken packaging and defective material."
        self.assertEqual(detect_category(text), "ecommerce_retail")

    def test_food_dining_detection(self):
        text = "The restaurant food was delicious, best biryani and polite waiter!"
        self.assertEqual(detect_category(text), "food_dining")

    def test_banking_fintech_detection(self):
        text = "UPI transaction failed and money got deducted from my bank account."
        self.assertEqual(detect_category(text), "banking_fintech")

    def test_travel_transit_detection(self):
        text = "Cab driver arrived on time for the morning airport ride."
        self.assertEqual(detect_category(text), "travel_transit")

    def test_tech_telecom_detection(self):
        text = "Broadband wifi disconnects every 10 minutes, speed is terrible."
        self.assertEqual(detect_category(text), "tech_telecom")

    def test_general_fallback(self):
        text = "Everything was completely average."
        self.assertEqual(detect_category(text), "general")

    def test_category_labels_and_list(self):
        self.assertEqual(get_category_label("food_dining"), "Food & Dining")
        all_cats = get_all_categories()
        self.assertTrue(any(c["id"] == "all" for c in all_cats))
        self.assertTrue(any(c["id"] == "food_dining" for c in all_cats))


class AnalyticsTrendsViewTests(TestCase):
    """Unit tests for GET /api/analytics/trends/ endpoint and service calculations."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="analyticsuser", password="TestPassword123!")
        self.other_user = User.objects.create_user(username="otheruser", password="TestPassword123!")
        self.url = reverse("analytics_trends")

    def test_anonymous_user_blocked(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data.get("error"), "auth_required")

    def test_authenticated_empty_state(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        summary = response.data.get("summary")
        self.assertEqual(summary["total_reviews"], 0)
        self.assertEqual(summary["net_sentiment_score"], 0.0)
        self.assertEqual(len(response.data.get("time_series")), 0)
        self.assertEqual(len(response.data.get("category_breakdown")), 0)

    def test_single_history_trends_aggregation(self):
        self.client.force_authenticate(user=self.user)
        now = timezone.now()

        # Seed 3 history records for self.user
        AnalysisHistory.objects.create(
            user=self.user,
            text="Loved the food and dinner!",
            sentiment="positive",
            confidence=95.0,
            category="food_dining",
        )
        AnalysisHistory.objects.create(
            user=self.user,
            text="Defective product and torn packaging.",
            sentiment="negative",
            confidence=85.0,
            category="ecommerce_retail",
        )
        AnalysisHistory.objects.create(
            user=self.user,
            text="Service was okay, nothing special.",
            sentiment="neutral",
            confidence=70.0,
            category="general",
        )

        # Seed 1 record for other user (should be excluded)
        AnalysisHistory.objects.create(
            user=self.other_user,
            text="Other user food was great.",
            sentiment="positive",
            confidence=90.0,
            category="food_dining",
        )

        response = self.client.get(self.url, {"range": "30d"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        summary = response.data["summary"]
        self.assertEqual(summary["total_reviews"], 3)
        self.assertEqual(summary["positive_count"], 1)
        self.assertEqual(summary["negative_count"], 1)
        self.assertEqual(summary["neutral_count"], 1)
        # Net sentiment score: 33.3% - 33.3% = 0.0%
        self.assertEqual(summary["net_sentiment_score"], 0.0)

        # Category breakdown contains 3 entries
        categories = {c["id"]: c for c in response.data["category_breakdown"]}
        self.assertIn("food_dining", categories)
        self.assertEqual(categories["food_dining"]["total"], 1)
        self.assertEqual(categories["food_dining"]["positive"], 1)

    def test_batch_records_aggregation(self):
        self.client.force_authenticate(user=self.user)

        # Seed BatchAnalysisRecord
        BatchAnalysisRecord.objects.create(
            user=self.user,
            filename="customer_feedback.csv",
            total_rows=10,
            processed_rows=10,
            positive_count=7,
            negative_count=2,
            neutral_count=1,
            mixed_count=0,
            avg_confidence=88.5,
            category_counts={
                "food_dining": {"positive": 4, "negative": 1, "neutral": 0, "mixed": 0},
                "banking_fintech": {"positive": 3, "negative": 1, "neutral": 1, "mixed": 0},
            },
            daily_breakdown={
                "2026-09-01": {"positive": 3, "negative": 1, "neutral": 0, "mixed": 0},
                "2026-09-02": {"positive": 4, "negative": 1, "neutral": 1, "mixed": 0},
            },
        )

        response = self.client.get(f"{self.url}?source=batch")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        summary = response.data["summary"]
        self.assertEqual(summary["total_reviews"], 10)
        self.assertEqual(summary["positive_count"], 7)
        self.assertEqual(summary["negative_count"], 2)
        # Net sentiment score: 70.0% - 20.0% = 50.0%
        self.assertEqual(summary["net_sentiment_score"], 50.0)

        # Time series points from daily_breakdown
        ts = response.data["time_series"]
        self.assertEqual(len(ts), 2)
        self.assertEqual(ts[0]["date"], "2026-09-01")
        self.assertEqual(ts[0]["total"], 4)

    def test_filtering_by_category_and_source(self):
        self.client.force_authenticate(user=self.user)

        AnalysisHistory.objects.create(
            user=self.user,
            text="Great meal!",
            sentiment="positive",
            confidence=90.0,
            category="food_dining",
        )
        AnalysisHistory.objects.create(
            user=self.user,
            text="App crashed.",
            sentiment="negative",
            confidence=85.0,
            category="tech_telecom",
        )

        # Filter strictly by food_dining category
        response = self.client.get(self.url, {"category": "food_dining"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        summary = response.data["summary"]
        self.assertEqual(summary["total_reviews"], 1)
        self.assertEqual(summary["positive_count"], 1)
        self.assertEqual(summary["negative_count"], 0)

        # Filter by source: batch only (should be 0 because we only have single history)
        response_batch = self.client.get(self.url, {"source": "batch"})
        self.assertEqual(response_batch.status_code, status.HTTP_200_OK)
        self.assertEqual(response_batch.data["summary"]["total_reviews"], 0)
