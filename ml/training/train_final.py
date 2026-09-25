#!/usr/bin/env python3
"""
Final Model Retraining Pipeline (Phase 6.3).

Retrains the winning Phase 5 Exp3 architecture on the expanded 6,000-record
processed dataset (data/processed/sentiment_dataset.csv).

Model Architecture:
- Word TF-IDF: analyzer='word', ngram_range=(1,1), min_df=2, sublinear_tf=True
- Character TF-IDF: analyzer='char_wb', ngram_range=(3,5), min_df=3, sublinear_tf=True
- FeatureUnion combining word + char features
- Classifier: LogisticRegression(max_iter=1000, class_weight=None, random_state=42)

Evaluations:
1. Standard 80/20 Stratified Holdout (4,800 train, 1,200 test)
2. Strict Unseen-Text Holdout (GroupShuffleSplit on text, 4,788 train, 1,212 test)
3. Language Slices (English vs. Hinglish) on standard holdout

Artifacts Saved:
- ml/models/sentiment_final_model.pkl
- ml/models/sentiment_final_vectorizer.pkl
- ml/models/final_model_metadata.json

Usage:
    python ml/training/train_final.py
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import FeatureUnion


TARGET_CLASSES = ["negative", "positive", "neutral", "mixed"]


def build_vectorizer() -> FeatureUnion:
    """Instantiate the Exp3 FeatureUnion vectorizer."""
    return FeatureUnion([
        (
            "word",
            TfidfVectorizer(
                analyzer="word",
                lowercase=True,
                ngram_range=(1, 1),
                min_df=2,
                sublinear_tf=True,
                norm="l2",
                use_idf=True,
                smooth_idf=True,
            ),
        ),
        (
            "char",
            TfidfVectorizer(
                analyzer="char_wb",
                lowercase=True,
                ngram_range=(3, 5),
                min_df=3,
                sublinear_tf=True,
                norm="l2",
                use_idf=True,
                smooth_idf=True,
            ),
        ),
    ])


def evaluate_split(
    clf: LogisticRegression,
    X_test_vec: Any,
    y_test: pd.Series,
) -> Dict[str, Any]:
    """Calculate key performance metrics on a given split."""
    preds = clf.predict(X_test_vec)
    acc = float(accuracy_score(y_test, preds))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test, preds, average="macro", zero_division=0
    )
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(
        y_test, preds, average="weighted", zero_division=0
    )

    # Per-class scores
    p_cls, r_cls, f1_cls, supp = precision_recall_fscore_support(
        y_test, preds, labels=TARGET_CLASSES, zero_division=0
    )
    per_class = {}
    for i, c in enumerate(TARGET_CLASSES):
        per_class[c] = {
            "precision": round(float(p_cls[i]), 4),
            "recall": round(float(r_cls[i]), 4),
            "f1_score": round(float(f1_cls[i]), 4),
            "support": int(supp[i]),
        }

    cm = confusion_matrix(y_test, preds, labels=TARGET_CLASSES)
    total_errors = int((preds != y_test).sum())

    return {
        "accuracy": round(acc, 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_precision": round(float(p_wt), 4),
        "weighted_recall": round(float(r_wt), 4),
        "weighted_f1": round(float(f1_wt), 4),
        "total_samples": len(y_test),
        "total_errors": total_errors,
        "per_class": per_class,
        "confusion_matrix": cm.tolist(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Train and evaluate final sentiment model.")
    base_dir = Path(__file__).resolve().parent.parent.parent
    parser.add_argument(
        "--dataset",
        type=Path,
        default=base_dir / "data" / "processed" / "sentiment_dataset.csv",
        help="Path to processed training dataset (expected 6,000 records)",
    )
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=base_dir / "ml" / "models",
        help="Directory to save final model artifacts",
    )
    parser.add_argument(
        "--random-state",
        type=int,
        default=42,
        help="Random state for reproducibility",
    )
    args = parser.parse_args()

    print("=" * 78)
    print("PHASE 6.3: RETRAIN EXP3 ON EXPANDED 6,000-RECORD DATASET")
    print("=" * 78)

    if not args.dataset.is_file():
        print(f"ERROR: Dataset not found: {args.dataset}", file=sys.stderr)
        return 1

    df = pd.read_csv(args.dataset)
    if len(df) != 6000:
        print(f"WARNING: Expected 6,000 records, got {len(df)}", file=sys.stderr)

    X = df["text"].astype(str)
    y = df["sentiment"].str.strip().str.lower()

    # 1. Standard 80/20 Stratified Split
    train_idx, test_idx = train_test_split(
        df.index, test_size=0.20, random_state=args.random_state, stratify=y
    )
    X_train_std, X_test_std = X.loc[train_idx], X.loc[test_idx]
    y_train_std, y_test_std = y.loc[train_idx], y.loc[test_idx]
    test_df_std = df.loc[test_idx]

    print(f"Loaded {len(df):,} records from {args.dataset.name}")
    print(f"Standard Split: Train={len(X_train_std):,}, Test={len(X_test_std):,}")

    # Build and fit vectorizer and model on standard split
    vec_final = build_vectorizer()
    X_tr_std_vec = vec_final.fit_transform(X_train_std)
    X_te_std_vec = vec_final.transform(X_test_std)

    clf_final = LogisticRegression(
        max_iter=1000, class_weight=None, random_state=args.random_state
    )
    clf_final.fit(X_tr_std_vec, y_train_std)

    std_metrics = evaluate_split(clf_final, X_te_std_vec, y_test_std)
    std_preds = clf_final.predict(X_te_std_vec)

    # Slice evaluations on standard test set
    en_mask = test_df_std["language"].str.lower() == "english"
    hi_mask = test_df_std["language"].str.lower() == "hinglish"
    sim_mask = test_df_std["complexity"].str.lower() == "simple"
    mod_mask = test_df_std["complexity"].str.lower() == "moderate"
    com_mask = test_df_std["complexity"].str.lower() == "complex"

    lang_metrics = {
        "english": {
            "total": int(en_mask.sum()),
            "correct": int((y_test_std[en_mask] == std_preds[en_mask]).sum()),
            "errors": int(en_mask.sum()) - int((y_test_std[en_mask] == std_preds[en_mask]).sum()),
            "accuracy": round(float(accuracy_score(y_test_std[en_mask], std_preds[en_mask])), 4),
        },
        "hinglish": {
            "total": int(hi_mask.sum()),
            "correct": int((y_test_std[hi_mask] == std_preds[hi_mask]).sum()),
            "errors": int(hi_mask.sum()) - int((y_test_std[hi_mask] == std_preds[hi_mask]).sum()),
            "accuracy": round(float(accuracy_score(y_test_std[hi_mask], std_preds[hi_mask])), 4),
        },
    }

    comp_metrics = {
        "simple_accuracy": round(float(accuracy_score(y_test_std[sim_mask], std_preds[sim_mask])), 4),
        "moderate_accuracy": round(float(accuracy_score(y_test_std[mod_mask], std_preds[mod_mask])), 4),
        "complex_accuracy": round(float(accuracy_score(y_test_std[com_mask], std_preds[com_mask])), 4),
    }

    # 2. Strict Grouped Split (Zero exact text overlap)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=args.random_state)
    g_train_idx, g_test_idx = next(gss.split(df, groups=df["text"]))
    X_train_strict, X_test_strict = X.loc[g_train_idx], X.loc[g_test_idx]
    y_train_strict, y_test_strict = y.loc[g_train_idx], y.loc[g_test_idx]

    vec_strict = build_vectorizer()
    X_tr_strict_vec = vec_strict.fit_transform(X_train_strict)
    X_te_strict_vec = vec_strict.transform(X_test_strict)

    clf_strict = LogisticRegression(
        max_iter=1000, class_weight=None, random_state=args.random_state
    )
    clf_strict.fit(X_tr_strict_vec, y_train_strict)
    strict_metrics = evaluate_split(clf_strict, X_te_strict_vec, y_test_strict)

    print(f"Strict Split:   Train={len(X_train_strict):,}, Test={len(X_test_strict):,} (0 text overlap)")
    print("-" * 78)
    print("EVALUATION 1 — STANDARD HOLDOUT (1,200 samples):")
    print(f"  Accuracy:    {std_metrics['accuracy']:.2%} ({1200 - std_metrics['total_errors']}/1,200)")
    print(f"  Macro F1:    {std_metrics['macro_f1']:.4f}")
    print(f"  Weighted F1: {std_metrics['weighted_f1']:.4f}")
    print(f"  Total Errors:{std_metrics['total_errors']} / 1,200")
    print("  Per-Class Metrics:")
    for c, sc in std_metrics["per_class"].items():
        print(f"    {c:<8}: P={sc['precision']:.4f} | R={sc['recall']:.4f} | F1={sc['f1_score']:.4f} (n={sc['support']})")
    print(f"  Confusion Matrix (rows=actual, cols=pred [{', '.join(TARGET_CLASSES)}]):")
    for row in std_metrics["confusion_matrix"]:
        print(f"    {row}")

    print("-" * 78)
    print("EVALUATION 4 — STRICT UNSEEN TEXT (1,212 samples):")
    print(f"  Accuracy:    {strict_metrics['accuracy']:.2%} ({len(X_test_strict) - strict_metrics['total_errors']}/{len(X_test_strict)})")
    print(f"  Macro F1:    {strict_metrics['macro_f1']:.4f}")
    print(f"  Weighted F1: {strict_metrics['weighted_f1']:.4f}")
    print(f"  Train Size:  {len(X_train_strict):,}, Test Size: {len(X_test_strict):,}")

    print("-" * 78)
    print("EVALUATION 5 — LANGUAGE PERFORMANCE (Standard Holdout):")
    print(f"  English:  {lang_metrics['english']['accuracy']:.2%} ({lang_metrics['english']['correct']}/{lang_metrics['english']['total']}, {lang_metrics['english']['errors']} errors)")
    print(f"  Hinglish: {lang_metrics['hinglish']['accuracy']:.2%} ({lang_metrics['hinglish']['correct']}/{lang_metrics['hinglish']['total']}, {lang_metrics['hinglish']['errors']} errors)")

    # Save artifacts
    args.models_dir.mkdir(parents=True, exist_ok=True)
    final_model_path = args.models_dir / "sentiment_final_model.pkl"
    final_vec_path = args.models_dir / "sentiment_final_vectorizer.pkl"
    meta_path = args.models_dir / "final_model_metadata.json"

    joblib.dump(clf_final, final_model_path)
    joblib.dump(vec_final, final_vec_path)

    metadata = {
        "model_name": "Phase 6.3 Final Model (Exp3 Architecture Retrained on 6,000 Records)",
        "base_architecture": "Exp3 (FeatureUnion: Word TF-IDF + Character n-grams TF-IDF)",
        "vectorizer": {
            "word": {
                "analyzer": "word",
                "ngram_range": [1, 1],
                "min_df": 2,
                "sublinear_tf": True,
            },
            "char": {
                "analyzer": "char_wb",
                "ngram_range": [3, 5],
                "min_df": 3,
                "sublinear_tf": True,
            },
        },
        "classifier": "LogisticRegression(max_iter=1000, class_weight=None, random_state=42)",
        "dataset": {
            "path": str(args.dataset),
            "total_records": len(df),
            "classes": TARGET_CLASSES,
        },
        "standard_split": {
            "train_size": len(X_train_std),
            "test_size": len(X_test_std),
            "random_state": args.random_state,
            "metrics": std_metrics,
            "language_metrics": lang_metrics,
            "complexity_metrics": comp_metrics,
        },
        "strict_split": {
            "train_size": len(X_train_strict),
            "test_size": len(X_test_strict),
            "random_state": args.random_state,
            "metrics": strict_metrics,
        },
        "feature_count": X_tr_std_vec.shape[1],
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("=" * 78)
    print(f"Artifacts successfully saved:")
    print(f"  Model:      {final_model_path}")
    print(f"  Vectorizer: {final_vec_path}")
    print(f"  Metadata:   {meta_path}")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
