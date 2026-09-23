from pathlib import Path

import joblib
from rest_framework.decorators import api_view
from rest_framework.response import Response


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "sentiment_model.pkl"
VECTORIZER_PATH = BASE_DIR / "model" / "tfidf_vectorizer.pkl"

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


@api_view(["POST"])
def predict_sentiment(request):
    text = request.data.get("text", "").strip()

    if not text:
        return Response(
            {"error": "Please enter some text to analyze."},
            status=400
        )

    cleaned_text = text.lower()

    text_tfidf = vectorizer.transform([cleaned_text])
    prediction = model.predict(text_tfidf)

    return Response({
        "sentiment": prediction[0]
    })