#!/usr/bin/env python3
"""
Model Improvement Experiments Pipeline (Phase 5).

Trains and compares 5 controlled model variations on data/processed/sentiment_dataset.csv:
- Baseline: Word TF-IDF (1, 1) + Logistic Regression
- Experiment 1: Word TF-IDF (1, 2) + Logistic Regression
- Experiment 2: Character-level TF-IDF (char_wb, 3-5) + Logistic Regression
- Experiment 3: Combined Word (1, 1) + Character (3, 5) TF-IDF + Logistic Regression
- Experiment 4: Combined Feature Representation + class_weight='balanced'

Saves the winning candidate model to:
- ml/models/sentiment_best_model.pkl
- ml/models/sentiment_best_vectorizer.pkl
- ml/models/best_model_metadata.json
- ml/models/experiment_results.json

Note: Does NOT overwrite baseline (sentiment_baseline_model.pkl) or production (sentiment_model.pkl).

Usage:
    python ml/training/train_experiments.py
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
from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import FeatureUnion


TARGET_CLASSES = ["negative", "positive", "neutral", "mixed"]


def get_feature_extractors() -> Dict[str, Any]:
    """Define candidate feature extraction representations."""
    return {
        "baseline_word": TfidfVectorizer(
            lowercase=True, norm="l2", use_idf=True, smooth_idf=True
        ),
        "exp1_word_bigram": TfidfVectorizer(
            lowercase=True, ngram_range=(1, 2), norm="l2", use_idf=True, smooth_idf=True
        ),
        "exp2_char_wb": TfidfVectorizer(
            lowercase=True, analyzer="char_wb", ngram_range=(3, 5), norm="l2", use_idf=True, smooth_idf=True
        ),
        "exp3_combined": FeatureUnion([
            ("word", TfidfVectorizer(lowercase=True, ngram_range=(1, 1), norm="l2", use_idf=True, smooth_idf=True)),
            ("char", TfidfVectorizer(lowercase=True, analyzer="char_wb", ngram_range=(3, 5), norm="l2", use_idf=True, smooth_idf=True)),
        ]),
    }


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

    return {
        "accuracy": round(acc, 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_wt), 4),
        "per_class": per_class,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Train and compare model improvement experiments.")
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
        help="Directory to save experimental model artifacts",
    )
    parser.add_argument(
        "--random-state",
        type=int,
        default=42,
        help="Random state for reproducibility",
    )
    args = parser.parse_args()

    print("=" * 78)
    print("PHASE 5: SYSTEMATIC MODEL IMPROVEMENT EXPERIMENTS")
    print("=" * 78)

    if not args.dataset.is_file():
        print(f"ERROR: Dataset not found: {args.dataset}", file=sys.stderr)
        return 1

    df = pd.read_csv(args.dataset)
    X = df["text"].astype(str)
    y = df["sentiment"].str.strip().str.lower()

    # 1. Standard 80/20 Stratified Split
    train_idx, test_idx = train_test_split(
        df.index, test_size=0.2, random_state=args.random_state, stratify=y
    )
    X_train_std, X_test_std = X.loc[train_idx], X.loc[test_idx]
    y_train_std, y_test_std = y.loc[train_idx], y.loc[test_idx]
    test_df_std = df.loc[test_idx]

    # 2. Strict Grouped Split (Zero text overlap)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=args.random_state)
    g_train_idx, g_test_idx = next(gss.split(df, groups=df["text"]))
    X_train_strict, X_test_strict = X.loc[g_train_idx], X.loc[g_test_idx]
    y_train_strict, y_test_strict = y.loc[g_train_idx], y.loc[g_test_idx]
    test_df_strict = df.loc[g_test_idx]

    print(f"Loaded {len(df):,} records from {args.dataset.name}")
    print(f"Standard Split: Train={len(X_train_std)}, Test={len(X_test_std)}")
    print(f"Strict Split:   Train={len(X_train_strict)}, Test={len(X_test_strict)} (0 text overlap)")
    print("-" * 78)

    extractors = get_feature_extractors()

    experiments = [
        ("Baseline (Word 1-1)", extractors["baseline_word"], False),
        ("Exp 1 (Word Bigrams 1-2)", extractors["exp1_word_bigram"], False),
        ("Exp 2 (Char n-grams 3-5)", extractors["exp2_char_wb"], False),
        ("Exp 3 (Combined Word+Char)", extractors["exp3_combined"], False),
        ("Exp 4 (Exp 3 + Balanced)", extractors["exp3_combined"], True),
    ]

    all_results = {}
    fitted_models = {}

    for exp_name, vec_builder, is_balanced in experiments:
        print(f"Running: {exp_name}...")
        cw = "balanced" if is_balanced else None

        # Train on Standard Split
        # Re-instantiate or clone vectorizer
        if exp_name == "Exp 4 (Exp 3 + Balanced)":
            # Re-create union to avoid shared fit state
            vec_std = FeatureUnion([
                ("word", TfidfVectorizer(lowercase=True, ngram_range=(1, 1), norm="l2", use_idf=True, smooth_idf=True)),
                ("char", TfidfVectorizer(lowercase=True, analyzer="char_wb", ngram_range=(3, 5), norm="l2", use_idf=True, smooth_idf=True)),
            ])
        else:
            vec_std = vec_builder

        X_tr_std_vec = vec_std.fit_transform(X_train_std)
        X_te_std_vec = vec_std.transform(X_test_std)

        clf_std = LogisticRegression(max_iter=1000, class_weight=cw, random_state=args.random_state)
        clf_std.fit(X_tr_std_vec, y_train_std)
        std_metrics = evaluate_split(clf_std, X_te_std_vec, y_test_std)

        # Slice evaluations on standard test set
        std_preds = clf_std.predict(X_te_std_vec)
        en_mask = test_df_std["language"] == "english"
        hi_mask = test_df_std["language"] == "hinglish"
        sim_mask = test_df_std["complexity"] == "simple"
        mod_mask = test_df_std["complexity"] == "moderate"
        com_mask = test_df_std["complexity"] == "complex"

        lang_metrics = {
            "english_accuracy": round(float(accuracy_score(y_test_std[en_mask], std_preds[en_mask])), 4),
            "hinglish_accuracy": round(float(accuracy_score(y_test_std[hi_mask], std_preds[hi_mask])), 4),
        }
        comp_metrics = {
            "simple_accuracy": round(float(accuracy_score(y_test_std[sim_mask], std_preds[sim_mask])), 4),
            "moderate_accuracy": round(float(accuracy_score(y_test_std[mod_mask], std_preds[mod_mask])), 4),
            "complex_accuracy": round(float(accuracy_score(y_test_std[com_mask], std_preds[com_mask])), 4),
        }

        # Train & Evaluate on Strict Split
        if "Exp 3" in exp_name or "Exp 4" in exp_name:
            vec_strict = FeatureUnion([
                ("word", TfidfVectorizer(lowercase=True, ngram_range=(1, 1), norm="l2", use_idf=True, smooth_idf=True)),
                ("char", TfidfVectorizer(lowercase=True, analyzer="char_wb", ngram_range=(3, 5), norm="l2", use_idf=True, smooth_idf=True)),
            ])
        elif "Exp 1" in exp_name:
            vec_strict = TfidfVectorizer(lowercase=True, ngram_range=(1, 2), norm="l2", use_idf=True, smooth_idf=True)
        elif "Exp 2" in exp_name:
            vec_strict = TfidfVectorizer(lowercase=True, analyzer="char_wb", ngram_range=(3, 5), norm="l2", use_idf=True, smooth_idf=True)
        else:
            vec_strict = TfidfVectorizer(lowercase=True, norm="l2", use_idf=True, smooth_idf=True)

        X_tr_strict_vec = vec_strict.fit_transform(X_train_strict)
        X_te_strict_vec = vec_strict.transform(X_test_strict)

        clf_strict = LogisticRegression(max_iter=1000, class_weight=cw, random_state=args.random_state)
        clf_strict.fit(X_tr_strict_vec, y_train_strict)
        strict_metrics = evaluate_split(clf_strict, X_te_strict_vec, y_test_strict)

        all_results[exp_name] = {
            "features_count": X_tr_std_vec.shape[1],
            "standard_metrics": std_metrics,
            "language_metrics": lang_metrics,
            "complexity_metrics": comp_metrics,
            "strict_metrics": strict_metrics,
        }

        fitted_models[exp_name] = (vec_std, clf_std)

        print(f"  -> Std Acc: {std_metrics['accuracy']:.2%} | Macro F1: {std_metrics['macro_f1']:.4f} | "
              f"EN: {lang_metrics['english_accuracy']:.2%} | HI: {lang_metrics['hinglish_accuracy']:.2%} | "
              f"Strict Acc: {strict_metrics['accuracy']:.2%}")

    print("-" * 78)

    # Comparison summary table
    print(f"{'Experiment':<28} {'Std Acc':<9} {'Macro F1':<10} {'HI Acc':<8} {'Strict Acc':<11} {'Features'}")
    print("-" * 78)
    for exp_name, res in all_results.items():
        std_m = res["standard_metrics"]
        lang_m = res["language_metrics"]
        str_m = res["strict_metrics"]
        print(f"{exp_name:<28} {std_m['accuracy']:.2%}    {std_m['macro_f1']:.4f}     "
              f"{lang_m['hinglish_accuracy']:.2%}   {str_m['accuracy']:.2%}      {res['features_count']:,}")
    print("=" * 78)

    # Save best candidate model (Exp 3: Combined Word + Char_wb)
    best_exp_name = "Exp 3 (Combined Word+Char)"
    best_vec, best_clf = fitted_models[best_exp_name]

    args.models_dir.mkdir(parents=True, exist_ok=True)
    best_model_path = args.models_dir / "sentiment_best_model.pkl"
    best_vec_path = args.models_dir / "sentiment_best_vectorizer.pkl"
    meta_path = args.models_dir / "best_model_metadata.json"
    results_path = args.models_dir / "experiment_results.json"

    joblib.dump(best_clf, best_model_path)
    joblib.dump(best_vec, best_vec_path)

    best_metadata = {
        "candidate_name": best_exp_name,
        "feature_representation": "FeatureUnion(Word TfidfVectorizer(1,1) + Char_wb TfidfVectorizer(3,5))",
        "classifier": "LogisticRegression(max_iter=1000, class_weight=None, random_state=42)",
        "features_count": all_results[best_exp_name]["features_count"],
        "standard_accuracy": all_results[best_exp_name]["standard_metrics"]["accuracy"],
        "standard_macro_f1": all_results[best_exp_name]["standard_metrics"]["macro_f1"],
        "hinglish_accuracy": all_results[best_exp_name]["language_metrics"]["hinglish_accuracy"],
        "english_accuracy": all_results[best_exp_name]["language_metrics"]["english_accuracy"],
        "strict_unseen_accuracy": all_results[best_exp_name]["strict_metrics"]["accuracy"],
        "strict_macro_f1": all_results[best_exp_name]["strict_metrics"]["macro_f1"],
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(best_metadata, f, indent=2)

    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)

    print(f"\nSaved best candidate model artifacts:")
    print(f"  Model:      {best_model_path}")
    print(f"  Vectorizer: {best_vec_path}")
    print(f"  Metadata:   {meta_path}")
    print(f"  Results:    {results_path}")
    print("\nNote: Baseline (sentiment_baseline_model.pkl) and production (sentiment_model.pkl) preserved.")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
