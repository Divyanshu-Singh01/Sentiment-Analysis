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
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import AnalysisHistory

from .language_detection import (
    DEVANAGARI_REGEX,
    detect_supported_language,
    devanagari_to_hinglish,
)

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

    # Validate language before sentiment prediction
    lang_info = detect_supported_language(text)
    if not lang_info.get("supported", False):
        return Response(
            {
                "success": False,
                "error": "language_not_supported",
                "message": "Sorry, I currently support sentiment analysis for English and Hindi/Hinglish only.",
                "detected_language": lang_info.get("language_name", "Unknown"),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Transliterate Devanagari Hindi into Roman Hinglish so the model's learned
    # subword features and vocabulary are activated identically to native Hinglish
    analysis_text = devanagari_to_hinglish(text) if DEVANAGARI_REGEX.search(text) else text
    cleaned_text = analysis_text.lower()

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

    if is_authenticated:
        # Save analysis history strictly for authenticated users after successful prediction
        confidence_val = round(score * 100, 2)
        detected_lang = lang_info.get("language_name", "English")
        AnalysisHistory.objects.create(
            user=request.user,
            text=text,
            sentiment=top_class,
            confidence=confidence_val,
            language=detected_lang,
        )
    else:
        anon_count = request.session.get("anonymous_prediction_count", 0) + 1
        request.session["anonymous_prediction_count"] = anon_count
        remaining = max(0, MAX_ANONYMOUS_PREDICTIONS - anon_count)
        response_data["free_predictions_remaining"] = remaining

    return Response(response_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_history(request):
    """
    Retrieve sentiment analysis history for the current authenticated user only.
    Ordered by newest to oldest with optional pagination and text search.
    """
    queryset = AnalysisHistory.objects.filter(user=request.user)

    search_term = request.query_params.get("search", "").strip()
    if search_term:
        queryset = queryset.filter(text__icontains=search_term)

    sentiment_filter = request.query_params.get("sentiment", "").strip().lower()
    if sentiment_filter and sentiment_filter != "all":
        queryset = queryset.filter(sentiment=sentiment_filter)

    total_count = queryset.count()

    try:
        page_size = min(max(1, int(request.query_params.get("page_size", 20))), 100)
    except (ValueError, TypeError):
        page_size = 20

    try:
        page_num = max(1, int(request.query_params.get("page", 1)))
    except (ValueError, TypeError):
        page_num = 1

    total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1
    start_idx = (page_num - 1) * page_size
    end_idx = start_idx + page_size

    items = queryset[start_idx:end_idx]

    history_data = [
        {
            "id": item.id,
            "text": item.text,
            "sentiment": item.sentiment,
            "confidence": item.confidence,
            "score": round(item.confidence / 100.0, 4),
            "language": item.language,
            "created_at": item.created_at.isoformat(),
        }
        for item in items
    ]

    return Response(
        {
            "success": True,
            "total_count": total_count,
            "page": page_num,
            "total_pages": total_pages,
            "page_size": page_size,
            "history": history_data,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_history_item(request, history_id):
    """
    Delete a specific history entry.
    Ensures User isolation: User A cannot delete User B's record.
    """
    record = AnalysisHistory.objects.filter(id=history_id, user=request.user).first()
    if not record:
        return Response(
            {"error": "History record not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    record.delete()
    return Response(
        {
            "success": True,
            "message": "Record deleted successfully.",
            "deleted_id": history_id,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_history(request):
    """
    Clear all history entries belonging exclusively to the authenticated user.
    """
    deleted_count, _ = AnalysisHistory.objects.filter(user=request.user).delete()
    return Response(
        {
            "success": True,
            "message": f"Successfully cleared {deleted_count} history records.",
            "deleted_count": deleted_count,
        }
    )