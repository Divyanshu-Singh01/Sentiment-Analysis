from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = BASE_DIR / "data" / "cleaned_sentiment_dataset.csv"
MODEL_PATH = BASE_DIR / "model" / "sentiment_model.pkl"
VECTORIZER_PATH = BASE_DIR / "model" / "tfidf_vectorizer.pkl"


def main():
    # Load dataset
    data = pd.read_csv(CSV_PATH)

    data["clean_text"] = data["clean_text"].fillna("").astype(str)
    data["sentiment"] = data["sentiment"].str.strip().str.lower()

    # Input and target
    X = data["clean_text"]
    y = data["sentiment"]

    # Create the same train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # Load trained model and TF-IDF vectorizer
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    # Convert test text into TF-IDF features
    X_test_tfidf = vectorizer.transform(X_test)

    # Predict sentiment
    y_pred = model.predict(X_test_tfidf)

    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)

    print("Model Evaluation")
    print("----------------")
    print(f"Accuracy: {accuracy:.2%}")

    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Confusion matrix
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))


if __name__ == "__main__":
    main()
    