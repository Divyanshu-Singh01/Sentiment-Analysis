from pathlib import Path
import re

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "sentiment_dataset.csv"


def load_dataset(path: Path) -> pd.DataFrame:
    with path.open("r", encoding="utf-8", errors="replace") as csv_file:
        lines = [line.strip() for line in csv_file if line.strip()]

    if not lines:
        raise ValueError(f"Dataset is empty: {path}")

    # Remove header if the first line is not tab-separated
    if "\t" not in lines[0]:
        lines = lines[1:]

    rows = [line.split("\t") for line in lines]
    rows = [
        [cell.strip() for cell in row]
        for row in rows
        if len(row) >= 2
    ]

    return pd.DataFrame(rows, columns=["text", "sentiment"])


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def main():
    # Load original dataset
    data = load_dataset(CSV_PATH)

    # Clean the text
    data["clean_text"] = data["text"].apply(clean_text)

    # Show original and cleaned text
    print("Original and cleaned text:\n")
    print(data[["text", "clean_text"]].head())

    # Show sentiment values
    print("\nSentiment distribution:")
    print(data["sentiment"].value_counts())

    # Save cleaned dataset
    output_path = BASE_DIR / "data" / "cleaned_sentiment_dataset.csv"
    data.to_csv(output_path, index=False)

    print("\nCleaned dataset saved successfully:")
    print(output_path)


if __name__ == "__main__":
    main()