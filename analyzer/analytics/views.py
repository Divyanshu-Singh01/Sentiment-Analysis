import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .service import calculate_analytics_trends

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def analytics_trends_view(request):
    """
    Retrieve live sentiment trend analytics, time-series distributions,
    and category breakdowns for the authenticated user.
    Anonymous requests receive 403 Forbidden with auth prompt.
    """
    if not request.user.is_authenticated:
        return Response(
            {
                "error": "auth_required",
                "message": "Live sentiment trend analytics are exclusively available for authenticated accounts. "
                           "Please log in or create a free account to view your trend metrics.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    date_range = request.query_params.get("range", "30d").strip().lower()
    if date_range not in ("7d", "30d", "90d", "all"):
        date_range = "30d"

    category = request.query_params.get("category", "all").strip().lower()
    source = request.query_params.get("source", "history").strip().lower()
    if source not in ("history", "batch", "all"):
        source = "history"

    try:
        data = calculate_analytics_trends(
            user=request.user,
            date_range=date_range,
            category_filter=category,
            source_filter=source,
        )
        return Response({"success": True, **data}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("Failed to compute analytics trends: %s", exc)
        return Response(
            {
                "error": "analytics_error",
                "message": f"Unable to compute sentiment trends: {str(exc)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
