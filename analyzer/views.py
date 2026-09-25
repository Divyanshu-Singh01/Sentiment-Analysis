from pathlib import Path

import joblib
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "ml" / "models" / "sentiment_final_model.pkl"
VECTORIZER_PATH = BASE_DIR / "ml" / "models" / "sentiment_final_vectorizer.pkl"

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

MAX_ANONYMOUS_PREDICTIONS = 10


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Establish and return the CSRF token cookie and response payload
    for session-authenticated clients.
    """
    token = get_token(request)
    return Response({"csrfToken": token})


@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Register a new user with username, optional email, and password.
    Hashes the password securely, creates a Django session, and returns
    authenticated user info without exposing sensitive details.
    """
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    password_confirm = request.data.get("password_confirm", "")

    # 1. Validate username
    if not username:
        return Response(
            {"error": "Username is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {"error": "That username is already taken."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Validate email if provided
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"error": "Please enter a valid email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # 3. Validate passwords
    if not password:
        return Response(
            {"error": "Password is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not password_confirm:
        return Response(
            {"error": "Please confirm your password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if password != password_confirm:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 4. Create user securely using create_user (hashes password with PBKDF2)
    try:
        user = User.objects.create_user(
            username=username,
            email=email if email else "",
            password=password,
        )
    except Exception:
        return Response(
            {"error": "Unable to create account. Please try again."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 5. Automatically establish authenticated session
    login(request, user)

    return Response(
        {
            "authenticated": True,
            "username": user.username,
            "csrfToken": get_token(request),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate a user with username and password, creating a Django session.
    Returns generic error messages for invalid or missing credentials.
    """
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            "authenticated": True,
            "username": user.username,
            "csrfToken": get_token(request),
        })

    return Response(
        {"error": "Invalid username or password."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    """
    Check the current session's authentication state.
    Returns username if authenticated, or authenticated: false and remaining
    free predictions for anonymous visitors.
    """
    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "username": request.user.username,
        })

    anon_count = request.session.get("anonymous_prediction_count", 0)
    remaining = max(0, MAX_ANONYMOUS_PREDICTIONS - anon_count)
    return Response({
        "authenticated": False,
        "free_predictions_remaining": remaining,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Invalidate the current session and log out the user.
    Preserves any anonymous prediction count so a trivial login/logout cycle
    does not reset the limit.
    """
    anon_count = request.session.get("anonymous_prediction_count", 0)
    if request.user.is_authenticated:
        logout(request)
        if anon_count > 0:
            request.session["anonymous_prediction_count"] = anon_count

    return Response({
        "success": True,
        "message": "Logged out successfully.",
        "csrfToken": get_token(request),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def predict_sentiment(request):
    """
    Classify input text sentiment using the production ML model.
    Allows authenticated users unlimited access, and anonymous visitors
    up to 10 successful predictions per session.
    """
    is_authenticated = request.user.is_authenticated

    # Enforce anonymous usage limit
    if not is_authenticated:
        anon_count = request.session.get("anonymous_prediction_count", 0)
        if anon_count >= MAX_ANONYMOUS_PREDICTIONS:
            return Response(
                {
                    "error": "free_limit_reached",
                    "message": "You've reached the 10 free predictions. Create an account or log in to continue.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

    text = request.data.get("text", "").strip()

    if not text:
        return Response(
            {"error": "Please enter some text to analyze."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cleaned_text = text.lower()

    text_tfidf = vectorizer.transform([cleaned_text])
    classes = list(model.classes_)
    proba_raw = model.predict_proba(text_tfidf)[0]

    # Map probabilities to class names dynamically using model.classes_
    class_prob_pairs = sorted(zip(classes, proba_raw), key=lambda x: x[1], reverse=True)
    top_class, top_prob = class_prob_pairs[0]
    second_class, second_prob = class_prob_pairs[1]

    # Strict calculation: is_close is true only when top_probability - second_probability < 0.10
    is_close = bool((top_prob - second_prob) < 0.10)

    score = round(float(top_prob), 4)
    scores = {cls: round(float(prob), 4) for cls, prob in zip(classes, proba_raw)}

    response_data = {
        "sentiment": top_class,
        "score": score,
        "scores": scores,
        "is_close": is_close,
    }

    if not is_authenticated:
        anon_count = request.session.get("anonymous_prediction_count", 0) + 1
        request.session["anonymous_prediction_count"] = anon_count
        remaining = max(0, MAX_ANONYMOUS_PREDICTIONS - anon_count)
        response_data["free_predictions_remaining"] = remaining

    return Response(response_data)