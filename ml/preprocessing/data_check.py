from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent.parent
CSV_PATH = BASE_DIR / "data" / "raw"


def load_dataset(path: Path) -> pd.DataFrame:
    with path.open("r", encoding="utf-8", errors="replace") as csv_file:
        lines = [line.strip() for line in csv_file if line.strip()]

    if not lines:
        raise ValueError(f"Dataset is empty: {path}")

    if "\t" not in lines[0]:
        lines = lines[1:]

    rows = [line.split("\t") for line in lines]
    rows = [[cell.strip() for cell in row] for row in rows if len(row) >= 2]

    return pd.DataFrame(rows, columns=["text", "sentiment"])


def main():
    data = load_dataset(CSV_PATH)

    print(data.head())
    print("\nDataset shape:")
    print(data.shape)

    print("\nSentiment distribution:")
    print(data["sentiment"].value_counts())

    print("\nMissing values:")
    print(data.isnull().sum())


if __name__ == "__main__":
    main()