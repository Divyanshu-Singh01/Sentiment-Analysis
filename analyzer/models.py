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
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]
        verbose_name = "Analysis History"
        verbose_name_plural = "Analysis Histories"

    def __str__(self):
        return f"{self.user.username} - {self.sentiment} ({self.confidence:.1f}%) - {self.created_at:%Y-%m-%d %H:%M}"
