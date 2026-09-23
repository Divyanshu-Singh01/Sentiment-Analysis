from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "cleaned_sentiment_dataset.csv"


def main():
    # Load cleaned dataset
    data = pd.read_csv(CSV_PATH)

    # Make sure every text value is a string
    data["clean_text"] = data["clean_text"].fillna("").astype(str)

    # Input text
    X = data["clean_text"]

    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer()

    # Convert text into numerical features
    X_tfidf = vectorizer.fit_transform(X)

    print("Original number of records:", len(X))
    print("TF-IDF matrix shape:", X_tfidf.shape)

    print("\nFirst 10 words:")
    print(vectorizer.get_feature_names_out()[:10])


if __name__ == "__main__":
    main()