import json
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.test import TestCase, Client
from rest_framework import status
from rest_framework.test import APIClient


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
