import json
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.test import TestCase, Client
from rest_framework import status
from rest_framework.test import APIClient
from analyzer.models import AnalysisHistory


class Phase72ModelScoreAndAuthTests(TestCase):
    """
    Test suite for Phase 7.2: Model Score + Close Prediction UI
    and Phase 7.1.1: Public Limited Access + Signup regression.
    """

    def setUp(self):
        self.username = "testuser"
        self.password = "Secr3tPassword!"
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password
        )
        self.client = APIClient()

    # ==========================================
    # PHASE 7.2: MODEL SCORE & CLOSE PREDICTION
    # ==========================================

    def test_p72_01_sentiment_field_remains(self):
        """Test 1: Existing sentiment field remains in response."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "This product is absolutely wonderful, works perfectly and exceeded all my expectations!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("sentiment", data)
        self.assertEqual(data["sentiment"], "positive")

    def test_p72_02_score_exists_and_is_float(self):
        """Test 2: Score exists in response and is a float."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Great service and fast delivery!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("score", data)
        self.assertIsInstance(data["score"], float)

    def test_p72_03_score_matches_winning_class(self):
        """Test 3: Returned score matches probability of winning class."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Great service and fast delivery!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        winning_sentiment = data["sentiment"]
        score = data["score"]
        scores = data["scores"]
        self.assertAlmostEqual(score, scores[winning_sentiment], places=4)

    def test_p72_04_all_four_scores_exist(self):
        """Test 4: Response scores dictionary contains positive, negative, neutral, mixed."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Great service and fast delivery!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("scores", data)
        scores = data["scores"]
        for expected_class in ["positive", "negative", "neutral", "mixed"]:
            self.assertIn(expected_class, scores)
            self.assertIsInstance(scores[expected_class], float)

    def test_p72_05_scores_sum_to_approximately_one(self):
        """Test 5: Four probabilities sum to approximately 1.0."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Great service and fast delivery!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        scores = data["scores"]
        total = sum(scores.values())
        self.assertAlmostEqual(total, 1.0, places=2)

    def test_p72_06_is_close_exists_and_is_boolean(self):
        """Test 6: is_close exists in response and is a boolean."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Great service and fast delivery!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("is_close", data)
        self.assertIsInstance(data["is_close"], bool)

    def test_p72_07_close_prediction_detection(self):
        """
        Test 7: Close prediction: deterministic test input where top-two gap < 10%
        Input: 'The interface has changed after the latest update.'
        """
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "The interface has changed after the latest update."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["is_close"])

    def test_p72_08_normal_prediction_not_close(self):
        """
        Test 8: Normal prediction: deterministic test input where gap > 10%
        Input: 'This product is absolutely wonderful, works perfectly and exceeded all my expectations!'
        """
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "This product is absolutely wonderful, works perfectly and exceeded all my expectations!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertFalse(data["is_close"])

    # ==========================================
    # ANONYMOUS USAGE & LIMIT TESTS
    # ==========================================

    def test_p72_09_anonymous_usage_and_decrement(self):
        """Test 9: Anonymous prediction decrements free_predictions_remaining and includes scores."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "The delivery was quick and efficient."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data.get("free_predictions_remaining"), 9)
        self.assertIn("score", data)
        self.assertIn("scores", data)
        self.assertIn("is_close", data)

    def test_p72_10_invalid_input_does_not_consume_prediction(self):
        """Test 10: Invalid input returns 400 and does NOT consume anonymous prediction."""
        client = Client()
        res_empty = client.post(
            "/api/predict/",
            json.dumps({"text": "   "}),
            content_type="application/json"
        )
        self.assertEqual(res_empty.status_code, status.HTTP_400_BAD_REQUEST)

        res_me = client.get("/api/auth/me/")
        self.assertEqual(res_me.status_code, status.HTTP_200_OK)
        self.assertEqual(res_me.json().get("free_predictions_remaining"), 10)

    def test_p72_11_limit_enforcement_blocks_at_10(self):
        """Test 11: Anonymous visitor can make 10 predictions and is blocked on #11."""
        client = Client()
        for i in range(10):
            res = client.post(
                "/api/predict/",
                json.dumps({"text": f"Review {i}"}),
                content_type="application/json"
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK)

        res_11 = client.post(
            "/api/predict/",
            json.dumps({"text": "Review 11"}),
            content_type="application/json"
        )
        self.assertEqual(res_11.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res_11.json().get("error"), "free_limit_reached")

    def test_p72_12_authenticated_users_unlimited_no_remaining_field(self):
        """Test 12: Authenticated user has unlimited predictions without free_predictions_remaining field."""
        client = Client()
        client.login(username=self.username, password=self.password)

        for i in range(12):
            res = client.post(
                "/api/predict/",
                json.dumps({"text": f"Authenticated user review {i}"}),
                content_type="application/json"
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            data = res.json()
            self.assertNotIn("free_predictions_remaining", data)
            self.assertIn("score", data)
            self.assertIn("scores", data)
            self.assertIn("is_close", data)

    # ==========================================
    # AUTHENTICATION REGRESSION TESTS
    # ==========================================

    def test_auth_signup_succeeds_and_hashes_password(self):
        """Verify signup creates user, hashes password, and logs in."""
        raw_pw = "Password123!"
        client = Client()
        res = client.post(
            "/api/auth/signup/",
            json.dumps({
                "username": "newuser72",
                "email": "user72@example.com",
                "password": raw_pw,
                "password_confirm": raw_pw
            }),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", res.json())

        user = User.objects.get(username="newuser72")
        self.assertTrue(check_password(raw_pw, user.password))

        # Immediately can predict
        pred_res = client.post(
            "/api/predict/",
            json.dumps({"text": "Feedback right after sign up."}),
            content_type="application/json"
        )
        self.assertEqual(pred_res.status_code, status.HTTP_200_OK)

    def test_auth_duplicate_username_and_password_mismatch(self):
        """Verify validation errors for duplicate username and password mismatch."""
        client = Client()
        # Duplicate username
        res_dup = client.post(
            "/api/auth/signup/",
            json.dumps({
                "username": self.username,
                "password": "Password123!",
                "password_confirm": "Password123!"
            }),
            content_type="application/json"
        )
        self.assertEqual(res_dup.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res_dup.json().get("error"), "That username is already taken.")

        # Password mismatch
        res_mis = client.post(
            "/api/auth/signup/",
            json.dumps({
                "username": "mismatch72",
                "password": "Password123!",
                "password_confirm": "Different!"
            }),
            content_type="application/json"
        )
        self.assertEqual(res_mis.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res_mis.json().get("error"), "Passwords do not match.")

    def test_auth_login_logout_and_csrf(self):
        """Verify login, logout, and CSRF protection."""
        client = Client()
        # Login
        res_login = client.post(
            "/api/auth/login/",
            json.dumps({"username": self.username, "password": self.password}),
            content_type="application/json"
        )
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)

        # Logout
        res_logout = client.post("/api/auth/logout/")
        self.assertEqual(res_logout.status_code, status.HTTP_200_OK)

        # CSRF check
        client_csrf = Client(enforce_csrf_checks=True)
        res_csrf = client_csrf.post(
            "/api/auth/signup/",
            json.dumps({"username": "csrftest", "password": "Password123!", "password_confirm": "Password123!"}),
            content_type="application/json"
        )
        self.assertEqual(res_csrf.status_code, status.HTTP_403_FORBIDDEN)


class LanguageSupportValidationTests(TestCase):
    """
    Test suite for Language Support Validation.
    Verifies that English, Hindi, and Hinglish are allowed through to the model,
    while unsupported languages are cleanly intercepted with a structured error.
    """

    def test_english_supported_and_predicts(self):
        """English text is supported and successfully produces a sentiment prediction."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "This service is amazing."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("sentiment", data)
        self.assertIn("score", data)

    def test_hinglish_supported_and_predicts(self):
        """Hinglish/Roman Hindi texts are supported and successfully produce predictions."""
        client = Client()
        hinglish_samples = [
            "Bahut acha service hai.",
            "ye product bahut accha hai",
            "service bahut bekar thi",
            "delivery bahut late thi",
            "bhai service mast hai"
        ]
        for sample in hinglish_samples:
            res = client.post(
                "/api/predict/",
                json.dumps({"text": sample}),
                content_type="application/json"
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK, f"Failed for Hinglish sample: {sample}")
            data = res.json()
            self.assertIn("sentiment", data)

    def test_hindi_devanagari_supported_and_accurate(self):
        """Hindi text in Devanagari script is supported and accurately predicted via transliteration."""
        client = Client()
        # Positive Devanagari review
        res_pos = client.post(
            "/api/predict/",
            json.dumps({"text": "यह सेवा बहुत अच्छी है।"}),
            content_type="application/json"
        )
        self.assertEqual(res_pos.status_code, status.HTTP_200_OK)
        data_pos = res_pos.json()
        self.assertEqual(data_pos.get("sentiment"), "positive")

        # Negative Devanagari review
        res_neg = client.post(
            "/api/predict/",
            json.dumps({"text": "यह बहुत बेकार और खराब उत्पाद है।"}),
            content_type="application/json"
        )
        self.assertEqual(res_neg.status_code, status.HTTP_200_OK)
        data_neg = res_neg.json()
        self.assertEqual(data_neg.get("sentiment"), "negative")

    def test_spanish_unsupported(self):
        """Spanish text is rejected with language_not_supported error and not sent to model."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Este servicio es excelente."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        data = res.json()
        self.assertEqual(data.get("success"), False)
        self.assertEqual(data.get("error"), "language_not_supported")
        self.assertEqual(data.get("detected_language"), "Spanish")
        self.assertIn("English and Hindi/Hinglish only", data.get("message", ""))

    def test_japanese_unsupported(self):
        """Japanese text is rejected with language_not_supported error."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "このサービスは素晴らしいです。"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        data = res.json()
        self.assertEqual(data.get("success"), False)
        self.assertEqual(data.get("error"), "language_not_supported")
        self.assertEqual(data.get("detected_language"), "Japanese")

    def test_french_unsupported(self):
        """French text is rejected with language_not_supported error."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "Ce produit est vraiment magnifique et très utile."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        data = res.json()
        self.assertEqual(data.get("success"), False)
        self.assertEqual(data.get("error"), "language_not_supported")
        self.assertEqual(data.get("detected_language"), "French")

    def test_empty_input_preserves_existing_validation(self):
        """Empty input returns the existing validation message, not language detection error."""
        client = Client()
        res = client.post(
            "/api/predict/",
            json.dumps({"text": "   "}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        data = res.json()
        self.assertEqual(data.get("error"), "Please enter some text to analyze.")

    def test_short_english_words_supported(self):
        """Short English words like 'good' or 'bad' are not falsely rejected as foreign languages."""
        client = Client()
        for short_word in ["good", "bad", "poor"]:
            res = client.post(
                "/api/predict/",
                json.dumps({"text": short_word}),
                content_type="application/json"
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK, f"Failed on short word: {short_word}")
            data = res.json()
            self.assertIn("sentiment", data)

    def test_unsupported_language_does_not_consume_quota(self):
        """An unsupported language error does not consume an anonymous visitor's prediction quota."""
        client = Client()
        # Initial status check
        status_res = client.get("/api/auth/me/")
        initial_remaining = status_res.json().get("freePredictionsRemaining", 10)

        # Send unsupported language
        unsupported_res = client.post(
            "/api/predict/",
            json.dumps({"text": "Este servicio es excelente."}),
            content_type="application/json"
        )
        self.assertEqual(unsupported_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Quota remains unchanged
        status_res_after = client.get("/api/auth/me/")
        after_remaining = status_res_after.json().get("freePredictionsRemaining", 10)
        self.assertEqual(initial_remaining, after_remaining)


class UserAnalysisHistoryTests(TestCase):
    """
    Test suite for User Analysis History:
    - Auto-save history on successful prediction for authenticated users
    - Do not save for anonymous users
    - Do not save for unsupported languages, empty input, errors, or quota limits
    - Confidence parity between prediction response and database record
    - User isolation: User A sees only A's history, User B sees only B's history
    - Deletion of individual records by owner only (unauthorized delete returns 404)
    - Clear history for owner only without touching other users
    - Pagination, search, and filtering in history
    - Unauthenticated access returns HTTP 401/403
    """

    def setUp(self):
        self.user_a = User.objects.create_user(username="usera", password="Password123!")
        self.user_b = User.objects.create_user(username="userb", password="Password123!")

        self.client_a = Client()
        self.client_a.force_login(self.user_a)

        self.client_b = Client()
        self.client_b.force_login(self.user_b)

        self.anon_client = Client()

    def test_01_signed_in_user_analysis_automatically_saved(self):
        """Test 1: When a signed-in user analyzes text successfully, a history record is created."""
        input_text = "The delivery was quick and customer support was very helpful."
        res = self.client_a.post(
            "/api/predict/",
            json.dumps({"text": input_text}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        pred_data = res.json()

        # Verify record in database
        history_records = AnalysisHistory.objects.filter(user=self.user_a)
        self.assertEqual(history_records.count(), 1)
        record = history_records.first()
        self.assertEqual(record.text, input_text)
        self.assertEqual(record.sentiment, pred_data["sentiment"])
        self.assertEqual(record.language, "English")

    def test_02_multiple_analyses_tracked(self):
        """Test 2: Multiple analyses increment history count correctly."""
        texts = [
            "Great service and super fast turnaround.",
            "Worst customer experience I have ever had.",
            "Normal quality, nothing special.",
        ]
        for t in texts:
            res = self.client_a.post(
                "/api/predict/",
                json.dumps({"text": t}),
                content_type="application/json"
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(AnalysisHistory.objects.filter(user=self.user_a).count(), 3)

    def test_03_unsupported_language_not_saved(self):
        """Test 3: Unsupported languages return error and create NO history entry."""
        initial_count = AnalysisHistory.objects.count()
        res = self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "Este producto es pésimo y no funciona."}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnalysisHistory.objects.count(), initial_count)

    def test_04_empty_input_not_saved(self):
        """Test 4: Empty or invalid input creates NO history entry."""
        initial_count = AnalysisHistory.objects.count()
        res = self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "   "}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnalysisHistory.objects.count(), initial_count)

    def test_05_confidence_parity(self):
        """Test 5: Saved confidence matches the model score generated for the user."""
        res = self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "Absolutely fantastic and top notch experience!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        expected_confidence = round(data["score"] * 100, 2)

        record = AnalysisHistory.objects.filter(user=self.user_a).first()
        self.assertAlmostEqual(record.confidence, expected_confidence, places=1)

    def test_06_anonymous_user_creates_no_history(self):
        """Test 6: Predictions by anonymous visitors are never saved to history."""
        res = self.anon_client.post(
            "/api/predict/",
            json.dumps({"text": "Great service!"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(AnalysisHistory.objects.count(), 0)

    def test_07_user_isolation_get_history(self):
        """Test 7: User A sees only A's records, User B sees only B's records."""
        # User A makes 2 analyses
        self.client_a.post("/api/predict/", json.dumps({"text": "User A text 1"}), content_type="application/json")
        self.client_a.post("/api/predict/", json.dumps({"text": "User A text 2"}), content_type="application/json")

        # User B makes 1 analysis
        self.client_b.post("/api/predict/", json.dumps({"text": "User B text 1"}), content_type="application/json")

        # Fetch history for User A
        res_a = self.client_a.get("/api/history/")
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        data_a = res_a.json()
        self.assertEqual(data_a["total_count"], 2)
        self.assertEqual(len(data_a["history"]), 2)
        for item in data_a["history"]:
            self.assertTrue(item["text"].startswith("User A"))

        # Fetch history for User B
        res_b = self.client_b.get("/api/history/")
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        data_b = res_b.json()
        self.assertEqual(data_b["total_count"], 1)
        self.assertEqual(len(data_b["history"]), 1)
        self.assertEqual(data_b["history"][0]["text"], "User B text 1")

    def test_08_delete_own_history_item(self):
        """Test 8: User A can delete their own history entry."""
        self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "This is a great product and I want to delete this record later."}),
            content_type="application/json"
        )
        record = AnalysisHistory.objects.filter(user=self.user_a).first()
        self.assertIsNotNone(record)

        del_res = self.client_a.delete(f"/api/history/{record.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(AnalysisHistory.objects.filter(id=record.id).exists())

    def test_09_unauthorized_delete_forbidden(self):
        """Test 9: User A cannot delete User B's history entry."""
        self.client_b.post(
            "/api/predict/",
            json.dumps({"text": "User B secret analysis that should never be deleted by User A."}),
            content_type="application/json"
        )
        record_b = AnalysisHistory.objects.filter(user=self.user_b).first()
        self.assertIsNotNone(record_b)

        # User A attempts to delete User B's record
        del_res = self.client_a.delete(f"/api/history/{record_b.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_404_NOT_FOUND)

        # Record B still exists
        self.assertTrue(AnalysisHistory.objects.filter(id=record_b.id).exists())

    def test_10_clear_history_only_affects_authenticated_user(self):
        """Test 10: Clear history clears only current user's records, leaving others untouched."""
        self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "User A review for testing clear history action."}),
            content_type="application/json"
        )
        self.client_b.post(
            "/api/predict/",
            json.dumps({"text": "User B review that must stay intact when User A clears."}),
            content_type="application/json"
        )

        clear_res = self.client_a.delete("/api/history/clear/")
        self.assertEqual(clear_res.status_code, status.HTTP_200_OK)

        # User A's history is empty
        self.assertEqual(AnalysisHistory.objects.filter(user=self.user_a).count(), 0)

        # User B's history is untouched
        self.assertEqual(AnalysisHistory.objects.filter(user=self.user_b).count(), 1)

    def test_11_unauthenticated_history_endpoints_rejected(self):
        """Test 11: Unauthenticated requests to history endpoints return 401 or 403."""
        get_res = self.anon_client.get("/api/history/")
        self.assertIn(get_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        del_res = self.anon_client.delete("/api/history/1/")
        self.assertIn(del_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        clear_res = self.anon_client.delete("/api/history/clear/")
        self.assertIn(clear_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_12_history_search_and_filter(self):
        """Test 12: History API supports search and sentiment filtering."""
        self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "The delivery was super fast and arrived ahead of time."}),
            content_type="application/json"
        )
        self.client_a.post(
            "/api/predict/",
            json.dumps({"text": "The packaging was horrible and very slow."}),
            content_type="application/json"
        )

        # Search query
        search_res = self.client_a.get("/api/history/?search=delivery")
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        data = search_res.json()
        self.assertEqual(data["total_count"], 1)
        self.assertIn("delivery", data["history"][0]["text"])

        # Sentiment filter
        pos_res = self.client_a.get("/api/history/?sentiment=positive")
        self.assertEqual(pos_res.status_code, status.HTTP_200_OK)
        pos_data = pos_res.json()
        self.assertTrue(all(item["sentiment"] == "positive" for item in pos_data["history"]))


