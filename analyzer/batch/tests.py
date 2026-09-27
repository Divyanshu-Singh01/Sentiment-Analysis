import io
import pandas as pd
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class BatchPredictionTests(TestCase):
    """
    Comprehensive test suite covering all scenarios for the Batch File Upload API:
    - Authentication gate
    - Format and boundary validation
    - In-memory parsing & Excel parsing
    - Formula injection protection
    - Vectorized sentiment results
    """

    def setUp(self):
        self.client = APIClient()
        self.username = "batch_tester"
        self.password = "SecurePassword123!"
        self.user = User.objects.create_user(
            username=self.username, password=self.password
        )

    def test_anonymous_user_blocked(self):
        """Anonymous requests must be rejected with HTTP 403 Forbidden."""
        csv_content = b"review_text\nGreat product loved it!"
        file = SimpleUploadedFile("reviews.csv", csv_content, content_type="text/csv")

        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data.get("error"), "auth_required")

    def test_missing_file_returns_400(self):
        """Submitting a request without a file returns HTTP 400 Bad Request."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/predict/batch/", {}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("error"), "missing_file")

    def test_empty_file_returns_400(self):
        """Uploading an empty 0-byte file returns HTTP 400."""
        self.client.force_authenticate(user=self.user)
        file = SimpleUploadedFile("empty.csv", b"", content_type="text/csv")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("empty", response.data.get("message", "").lower())

    def test_unsupported_file_format_returns_400(self):
        """Uploading an unsupported file format (.pdf) returns HTTP 400."""
        self.client.force_authenticate(user=self.user)
        file = SimpleUploadedFile("document.pdf", b"%PDF-1.4...", content_type="application/pdf")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("unsupported", response.data.get("message", "").lower())

    def test_authenticated_user_csv_success(self):
        """Authenticated user uploading a valid CSV receives 200 with summary and preview."""
        self.client.force_authenticate(user=self.user)
        csv_data = (
            "id,customer,review_text\n"
            "1,Alice,\"I absolutely loved this product, works perfectly!\"\n"
            "2,Bob,\"Very bad service, order never arrived.\"\n"
            "3,Charlie,\"The app was fine nothing special.\"\n"
            "4,Diana,\"Great screen but battery life is terrible.\"\n"
            "5,Rahul,\"bhai doctor ne time pe dekha aur dawai bhi sahi di\"\n"
        ).encode("utf-8")

        file = SimpleUploadedFile("reviews.csv", csv_data, content_type="text/csv")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        summary = response.data["summary"]
        self.assertEqual(summary["total_rows"], 5)
        self.assertEqual(summary["processed_rows"], 5)
        self.assertEqual(summary["detected_column"], "review_text")

        # Check sentiment counts exist
        counts = summary["sentiment_counts"]
        self.assertIn("positive", counts)
        self.assertIn("negative", counts)
        self.assertGreater(counts["positive"], 0)
        self.assertGreater(counts["negative"], 0)

        # Check preview rows
        preview = response.data["preview_results"]
        self.assertEqual(len(preview), 5)
        self.assertEqual(preview[0]["sentiment"], "positive")
        self.assertEqual(preview[1]["sentiment"], "negative")

        # Check annotated CSV export
        annotated_csv = response.data["annotated_csv"]
        self.assertIn("predicted_sentiment", annotated_csv)
        self.assertIn("confidence_score", annotated_csv)

    def test_authenticated_user_excel_xlsx_success(self):
        """Uploading an Excel (.xlsx) file parses properly and executes inference."""
        self.client.force_authenticate(user=self.user)

        df = pd.DataFrame({
            "order_id": [101, 102, 103],
            "feedback": [
                "I absolutely loved this product, works perfectly!",
                "Terrible quality, broke on first day.",
                "Okay product does the job."
            ]
        })
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)

        file = SimpleUploadedFile(
            "orders.xlsx",
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["total_rows"], 3)
        self.assertEqual(response.data["summary"]["detected_column"], "feedback")

    def test_missing_text_column_returns_400(self):
        """CSV with only IDs and numbers returns friendly 400 error."""
        self.client.force_authenticate(user=self.user)
        csv_data = (
            "order_id,price,rating,zipcode\n"
            "1,299,5,110001\n"
            "2,599,1,400001\n"
        ).encode("utf-8")

        file = SimpleUploadedFile("numbers.csv", csv_data, content_type="text/csv")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("column", response.data.get("message", "").lower())

    def test_oversized_row_count_rejected(self):
        """Files exceeding the 2,000 row cap are rejected with 400."""
        self.client.force_authenticate(user=self.user)
        rows = ["review\n"] + ["Good service\n"] * 2005
        csv_data = "".join(rows).encode("utf-8")

        file = SimpleUploadedFile("massive.csv", csv_data, content_type="text/csv")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maximum batch limit", response.data.get("message", "").lower())

    def test_csv_formula_injection_sanitization(self):
        """Cells starting with =, +, -, @ must be prefixed with ' to prevent spreadsheet execution."""
        self.client.force_authenticate(user=self.user)
        csv_data = (
            "id,comment\n"
            "1,\"=SUM(1+1)\"\n"
            "2,\"+CMD('calc.exe')\"\n"
            "3,\"Normal comment\"\n"
        ).encode("utf-8")

        file = SimpleUploadedFile("injection.csv", csv_data, content_type="text/csv")
        response = self.client.post("/api/predict/batch/", {"file": file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        annotated_csv = response.data["annotated_csv"]
        self.assertIn("'=SUM(1+1)", annotated_csv)
        self.assertIn("'+CMD('calc.exe')", annotated_csv)
