from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent.parent.parent
CSV_PATH = BASE_DIR / "data" / "processed" / "cleaned_sentiment_dataset.csv"


def main():
    # Load cleaned dataset
    data = pd.read_csv(CSV_PATH)

    # Input and output
    X = data["clean_text"]
    y = data["sentiment"]

    # Split into training and testing data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("Total records:", len(data))
    print("Training records:", len(X_train))
    print("Testing records:", len(X_test))

    print("\nTraining sentiment distribution:")
    print(y_train.value_counts())

    print("\nTesting sentiment distribution:")
    print(y_test.value_counts())


if __name__ == "__main__":
    main()