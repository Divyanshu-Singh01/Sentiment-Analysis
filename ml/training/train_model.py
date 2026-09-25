from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent.parent.parent
CSV_PATH = BASE_DIR / "data" / "processed" / "cleaned_sentiment_dataset.csv"
MODEL_DIR = BASE_DIR / "ml" / "models"


def main():
    # Load cleaned dataset
    data = pd.read_csv(CSV_PATH)

    # Make sure text and sentiment are in the correct format
    data["clean_text"] = data["clean_text"].fillna("").astype(str)
    data["sentiment"] = data["sentiment"].str.strip().str.lower()

    # Input and target
    X = data["clean_text"]
    y = data["sentiment"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer()

    # Learn vocabulary from training data
    X_train_tfidf = vectorizer.fit_transform(X_train)

    # Transform testing data using the same vectorizer
    X_test_tfidf = vectorizer.transform(X_test)

    # Create Logistic Regression model
    model = LogisticRegression(max_iter=1000)

    # Train model
    model.fit(X_train_tfidf, y_train)

    # Create model directory
    MODEL_DIR.mkdir(exist_ok=True)

    # Save model and vectorizer
    joblib.dump(model, MODEL_DIR / "sentiment_model.pkl")
    joblib.dump(vectorizer, MODEL_DIR / "tfidf_vectorizer.pkl")

    print("Model trained successfully.")
    print("Training records:", len(X_train))
    print("Testing records:", len(X_test))
    print("TF-IDF features:", X_train_tfidf.shape[1])

    # Keep these for Task 7
    print("\nModel is ready for evaluation.")


if __name__ == "__main__":
    main()