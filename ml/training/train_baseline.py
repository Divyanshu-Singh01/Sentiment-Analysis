#!/usr/bin/env python3
"""
Baseline ML Training Pipeline (Phase 4).

Trains a 4-class multi-service sentiment classification baseline on
data/processed/sentiment_dataset.csv using TF-IDF + Logistic Regression.

Artifacts saved:
- ml/models/sentiment_baseline_model.pkl
- ml/models/sentiment_baseline_vectorizer.pkl
- ml/models/baseline_metadata.json

Note: Does NOT overwrite the existing production model (sentiment_model.pkl).

Usage:
    python ml/training/train_baseline.py
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Any, Dict, Tuple

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split


EXPECTED_CLASSES = ["negative", "positive", "neutral", "mixed"]


def check_dataset_integrity(df: pd.DataFrame) -> Dict[str, Any]:
    """Validate dataset structure before training."""
    if len(df) != 5000:
        raise ValueError(f"Expected 5,000 records, found {len(df)}")
    if df["text"].isna().any() or (df["text"].astype(str).str.strip() == "").any():
        raise ValueError("Dataset contains null or empty text records")
    if df["sentiment"].isna().any():
        raise ValueError("Dataset contains null sentiment labels")

    unique_classes = sorted(df["sentiment"].str.lower().unique())
    if sorted(EXPECTED_CLASSES) != unique_classes:
        raise ValueError(f"Expected classes {EXPECTED_CLASSES}, found {unique_classes}")

    return {
        "record_count": len(df),
        "classes": unique_classes,
        "class_distribution": df["sentiment"].value_counts().to_dict(),
    }


def perform_stratified_split(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, Dict[str, Any]]:
    """Perform reproducible stratified train/test split and check data leakage."""
    X = df["text"].astype(str)
    y = df["sentiment"].astype(str).str.strip().str.lower()

    train_idx, test_idx = train_test_split(
        df.index,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    X_train = X.loc[train_idx]
    X_test = X.loc[test_idx]
    y_train = y.loc[train_idx]
    y_test = y.loc[test_idx]

    # Check for text overlap / leakage between train and test
    train_texts = set(X_train)
    test_texts = set(X_test)
    overlap = train_texts.intersection(test_texts)
    overlapping_test_mask = X_test.isin(overlap)
    overlapping_test_count = int(overlapping_test_mask.sum())

    leakage_stats = {
        "train_size": len(X_train),
        "test_size": len(X_test),
        "train_class_distribution": y_train.value_counts().to_dict(),
        "test_class_distribution": y_test.value_counts().to_dict(),
        "unique_train_texts": len(train_texts),
        "unique_test_texts": len(test_texts),
        "overlapping_unique_texts": len(overlap),
        "overlapping_test_records": overlapping_test_count,
        "overlapping_test_percentage": round((overlapping_test_count / len(X_test)) * 100, 2),
    }

    return X_train, X_test, y_train, y_test, leakage_stats


def train_baseline_pipeline(
    X_train: pd.Series,
    y_train: pd.Series,
    random_state: int = 42,
) -> Tuple[TfidfVectorizer, LogisticRegression]:
    """Train standard TF-IDF + Logistic Regression multi-class baseline."""
    vectorizer = TfidfVectorizer(
        lowercase=True,
        norm="l2",
        use_idf=True,
        smooth_idf=True,
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)

    model = LogisticRegression(
        max_iter=1000,
        random_state=random_state,
    )
    model.fit(X_train_tfidf, y_train)

    return vectorizer, model


def main() -> int:
    parser = argparse.ArgumentParser(description="Train baseline multi-class sentiment classifier.")
    base_dir = Path(__file__).resolve().parent.parent.parent
    parser.add_argument(
        "--dataset",
        type=Path,
        default=base_dir / "data" / "processed" / "sentiment_dataset.csv",
        help="Path to processed training dataset",
    )
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=base_dir / "ml" / "models",
        help="Directory to save baseline model artifacts",
    )
    parser.add_argument(
        "--random-state",
        type=int,
        default=42,
        help="Random state for reproducibility",
    )
    args = parser.parse_args()

    print("=" * 72)
    print("PHASE 4: BASELINE ML MODEL TRAINING")
    print("=" * 72)

    # 1. Load dataset
    print(f"Loading dataset: {args.dataset}")
    if not args.dataset.is_file():
        print(f"ERROR: Dataset file not found: {args.dataset}", file=sys.stderr)
        return 1

    df = pd.read_csv(args.dataset)
    integrity = check_dataset_integrity(df)
    print(f"Dataset integrity verified: {integrity['record_count']} records, classes: {integrity['classes']}")
    print(f"Class distribution: {integrity['class_distribution']}")

    # 2. Train/Test split
    print(f"\nPerforming 80/20 stratified split (random_state={args.random_state})...")
    X_train, X_test, y_train, y_test, leakage = perform_stratified_split(
        df, test_size=0.2, random_state=args.random_state
    )
    print(f"  Training set size: {leakage['train_size']} records")
    print(f"  Testing set size:  {leakage['test_size']} records")
    print(f"  Train class distribution: {leakage['train_class_distribution']}")
    print(f"  Test class distribution:  {leakage['test_class_distribution']}")
    print(f"  Cross-split duplicate text check: {leakage['overlapping_unique_texts']} unique phrases "
          f"({leakage['overlapping_test_records']} test records, {leakage['overlapping_test_percentage']}%)")

    # 3. Train model
    print("\nTraining TF-IDF + LogisticRegression baseline...")
    vectorizer, model = train_baseline_pipeline(X_train, y_train, random_state=args.random_state)
    vocab_size = len(vectorizer.vocabulary_)
    print(f"  TF-IDF vocabulary size: {vocab_size:,} features")
    print("  Logistic Regression trained (max_iter=1000).")

    # 4. Preliminary test evaluation
    X_train_tfidf = vectorizer.transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    train_acc = accuracy_score(y_train, model.predict(X_train_tfidf))
    test_acc = accuracy_score(y_test, model.predict(X_test_tfidf))
    macro_f1 = f1_score(y_test, model.predict(X_test_tfidf), average="macro")
    weighted_f1 = f1_score(y_test, model.predict(X_test_tfidf), average="weighted")

    print(f"\nInitial Metrics:")
    print(f"  Train Accuracy: {train_acc:.2%}")
    print(f"  Test Accuracy:  {test_acc:.2%}")
    print(f"  Test Macro F1:  {macro_f1:.4f}")
    print(f"  Test W-Avg F1:  {weighted_f1:.4f}")

    # 5. Save baseline model artifacts (distinct from production model)
    args.models_dir.mkdir(parents=True, exist_ok=True)
    model_path = args.models_dir / "sentiment_baseline_model.pkl"
    vec_path = args.models_dir / "sentiment_baseline_vectorizer.pkl"
    meta_path = args.models_dir / "baseline_metadata.json"

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)

    metadata = {
        "model_name": "LogisticRegression",
        "vectorizer_name": "TfidfVectorizer",
        "classes": list(model.classes_),
        "vocabulary_size": vocab_size,
        "train_records": len(X_train),
        "test_records": len(X_test),
        "random_state": args.random_state,
        "train_accuracy": round(float(train_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "leakage_stats": leakage,
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved baseline artifacts:")
    print(f"  Model:      {model_path}")
    print(f"  Vectorizer: {vec_path}")
    print(f"  Metadata:   {meta_path}")
    print("\nNote: Production model (sentiment_model.pkl) remains untouched.")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
