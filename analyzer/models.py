from django.conf import settings
from django.db import models


class AnalysisHistory(models.Model):
    """
    Stores historical sentiment analysis records for authenticated users.
    Persists only upon successful sentiment predictions.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="analysis_history",
        db_index=True,
    )
    text = models.TextField()
    sentiment = models.CharField(max_length=32)
    confidence = models.FloatField(help_text="Confidence percentage value (e.g. 94.20)")
    language = models.CharField(max_length=64, default="English")
    category = models.CharField(
        max_length=64,
        default="general",
        db_index=True,
        help_text="Product or service sector category (e.g. food_dining, ecommerce_retail)",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "category"]),
        ]
        verbose_name = "Analysis History"
        verbose_name_plural = "Analysis Histories"

    def __str__(self):
        return f"{self.user.username} - {self.sentiment} ({self.confidence:.1f}%) - {self.created_at:%Y-%m-%d %H:%M}"


class BatchAnalysisRecord(models.Model):
    """
    Stores metadata, aggregate sentiment metrics, and category distributions
    for bulk files uploaded by authenticated users.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="batch_history",
        db_index=True,
    )
    filename = models.CharField(max_length=255)
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    positive_count = models.IntegerField(default=0)
    negative_count = models.IntegerField(default=0)
    neutral_count = models.IntegerField(default=0)
    mixed_count = models.IntegerField(default=0)
    avg_confidence = models.FloatField(default=0.0)
    category_counts = models.JSONField(default=dict, blank=True)
    daily_breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]
        verbose_name = "Batch Analysis Record"
        verbose_name_plural = "Batch Analysis Records"

    def __str__(self):
        return f"{self.user.username} - {self.filename} ({self.processed_rows} rows) - {self.created_at:%Y-%m-%d %H:%M}"

