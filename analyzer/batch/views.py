import logging
from pathlib import Path

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from analyzer.views import model, vectorizer
from .processor import (
    BatchProcessingError,
    detect_review_column,
    parse_uploaded_file,
    process_batch_predictions,
)

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def batch_predict_view(request):
    """
    Process an uploaded CSV or Excel file for bulk sentiment analysis.
    Strictly restricted to authenticated (signed-up) users.
    Anonymous requests are rejected with a clear 403 Forbidden error.
    """
    # 1. Enforce authenticated-only access policy
    if not request.user.is_authenticated:
        return Response(
            {
                "error": "auth_required",
                "message": "Batch file analysis is exclusively available for authenticated users. "
                           "Please log in or create a free account to unlock bulk uploads.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # 2. Check file presence
    if "file" not in request.FILES:
        return Response(
            {
                "error": "missing_file",
                "message": "Please upload a CSV or Excel (.xlsx) file to analyze.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    uploaded_file = request.FILES["file"]

    try:
        # 3. In-memory parse with encoding fallback & size limits
        df = parse_uploaded_file(uploaded_file)

        # 4. Detect review text column (or use user-specified column if passed)
        specified_col = request.data.get("column", "").strip()
        if specified_col and specified_col in df.columns:
            text_column = specified_col
        else:
            text_column = detect_review_column(df)

        # 5. Vectorized inference across dataset
        batch_output = process_batch_predictions(
            df=df,
            text_column=text_column,
            model=model,
            vectorizer=vectorizer,
        )

        # 6. Record batch execution in BatchAnalysisRecord for trend analytics
        summary_data = batch_output["summary"]
        sent_counts = summary_data["sentiment_counts"]
        try:
            from analyzer.models import BatchAnalysisRecord
            BatchAnalysisRecord.objects.create(
                user=request.user,
                filename=uploaded_file.name,
                total_rows=summary_data["total_rows"],
                processed_rows=summary_data["processed_rows"],
                positive_count=sent_counts.get("positive", 0),
                negative_count=sent_counts.get("negative", 0),
                neutral_count=sent_counts.get("neutral", 0),
                mixed_count=sent_counts.get("mixed", 0),
                avg_confidence=summary_data["average_confidence"],
                category_counts=summary_data.get("category_counts", {}),
                daily_breakdown=summary_data.get("daily_breakdown", {}),
            )
        except Exception as rec_err:
            logger.warning("Could not persist batch analysis record: %s", rec_err)

        return Response(
            {
                "success": True,
                "filename": uploaded_file.name,
                "summary": batch_output["summary"],
                "preview_results": batch_output["preview_results"],
                "annotated_csv": batch_output["annotated_csv"],
            },
            status=status.HTTP_200_OK,
        )

    except BatchProcessingError as exc:
        return Response(
            {"error": "validation_error", "message": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as exc:
        logger.exception("Unexpected error during batch analysis: %s", exc)
        return Response(
            {
                "error": "processing_failure",
                "message": f"Unable to process file due to an unexpected error: {str(exc)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
