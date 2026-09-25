#!/usr/bin/env python3
"""
Final Model Evaluation on Frozen Challenge Dataset (Phase 6.3).

Evaluates the retrained final model (sentiment_final_model.pkl) on the frozen
90-record challenge dataset (data/test/challenge_dataset.csv) and compares directly
against Phase 6 baseline performance.

Evaluations Reported:
1. Overall accuracy, macro F1, weighted F1, total errors
2. Per-class precision, recall, F1-score
3. Confusion matrix
4. Category-specific performance across all 12 categories:
   - transliteration
   - typos
   - ordinary English
   - bhai
   - mixed clauses (mixed_sentiment)
   - indirect complaints
   - short <=5 words
   - Hinglish
   - sarcasm
   - ambiguous
   - factual/neutral
   - polite complaints
5. Language performance on challenge set (English vs Hinglish)
6. Side-by-side Old vs New comparison table
7. Detailed error analysis (fixed, regressed, remaining errors)

Usage:
    python ml/evaluation/evaluate_final.py
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
)

# Canonical class labels
TARGET_CLASSES = ["positive", "negative", "neutral", "mixed"]

# Challenge category mapping (identical to Phase 6)
CATEGORY_TAGS = {
    # Short positive
    "CH001": ["short"], "CH002": ["short"], "CH053": ["short", "hinglish"],
    "CH056": ["short", "hinglish"], "CH060": ["short"],
    # Short negative
    "CH003": ["short"], "CH004": ["short"], "CH054": ["short", "hinglish"],
    "CH057": ["short", "hinglish"], "CH059": ["short"],
    # Short neutral
    "CH005": ["short"], "CH006": ["short"], "CH055": ["short", "hinglish"],
    "CH058": ["short"],
    # Short mixed
    "CH007": ["short"], "CH008": ["short"],
    # Hinglish transliteration variations
    "CH009": ["hinglish", "transliteration"], "CH010": ["hinglish", "transliteration"],
    "CH011": ["hinglish", "transliteration"], "CH012": ["hinglish", "transliteration"],
    "CH013": ["hinglish", "transliteration"], "CH014": ["hinglish", "transliteration"],
    "CH015": ["hinglish", "transliteration"], "CH016": ["hinglish", "transliteration"],
    "CH017": ["hinglish"], "CH018": ["hinglish"],
    # Spelling mistakes / typos
    "CH049": ["typos"], "CH050": ["typos"], "CH051": ["typos"], "CH052": ["typos"],
    # Indirect complaints as questions
    "CH019": ["indirect_complaint"], "CH020": ["indirect_complaint"],
    "CH021": ["indirect_complaint"], "CH022": ["indirect_complaint"],
    # Polite complaints
    "CH031": ["polite_complaint"], "CH032": ["polite_complaint"],
    "CH033": ["polite_complaint"], "CH034": ["polite_complaint"],
    "CH079": ["polite_complaint"],
    # Sarcastic complaints
    "CH027": ["sarcasm"], "CH028": ["sarcasm"], "CH029": ["sarcasm"], "CH030": ["sarcasm"],
    # Mixed sentiment
    "CH023": ["mixed_sentiment"], "CH024": ["mixed_sentiment"],
    "CH025": ["mixed_sentiment"], "CH026": ["mixed_sentiment"],
    "CH061": ["mixed_sentiment"], "CH062": ["mixed_sentiment", "hinglish"],
    "CH063": ["mixed_sentiment"], "CH064": ["mixed_sentiment", "hinglish"],
    "CH076": ["mixed_sentiment", "hinglish"], "CH077": ["mixed_sentiment", "hinglish"],
    "CH078": ["mixed_sentiment", "hinglish"], "CH081": ["mixed_sentiment", "hinglish"],
    "CH083": ["mixed_sentiment", "hinglish"],
    # Bhai particle
    "CH035": ["bhai", "hinglish"], "CH036": ["bhai", "hinglish"],
    "CH037": ["bhai", "hinglish"], "CH038": ["bhai", "hinglish"],
    "CH039": ["bhai", "hinglish"], "CH040": ["bhai", "hinglish"],
    "CH065": ["bhai", "hinglish"], "CH066": ["bhai", "hinglish"],
    "CH067": ["bhai", "hinglish"], "CH068": ["bhai", "hinglish"],
    "CH086": ["bhai", "hinglish"],
    # Ordinary English
    "CH041": ["ordinary"], "CH042": ["ordinary"], "CH043": ["ordinary"],
    "CH044": ["ordinary"], "CH045": ["ordinary"],
    "CH071": ["ordinary"], "CH072": ["ordinary"],
    "CH089": ["ordinary"], "CH090": ["ordinary"],
    # Factual / neutral
    "CH046": ["factual"], "CH047": ["factual"], "CH048": ["factual"],
    "CH073": ["factual"], "CH074": ["factual"], "CH075": ["factual"],
    "CH085": ["factual"],
    # Ambiguous / difficult
    "CH080": ["ambiguous"], "CH082": ["ambiguous"], "CH084": ["ambiguous"],
    "CH087": ["ambiguous", "hinglish"], "CH088": ["ambiguous", "hinglish"],
    # Additional Hinglish
    "CH069": ["hinglish"], "CH070": ["hinglish"],
}

# Previous Phase 6 baseline numbers for direct comparison
PHASE6_BASELINE = {
    "overall": {
        "accuracy": 0.4778,
        "macro_precision": 0.4573,
        "macro_recall": 0.4489,
        "macro_f1": 0.4316,
        "weighted_precision": 0.4712,
        "weighted_recall": 0.4778,
        "weighted_f1": 0.4589,
        "total_errors": 47,
    },
    "per_class": {
        "positive": {"precision": 0.5200, "recall": 0.5652, "f1_score": 0.5417, "support": 23},
        "negative": {"precision": 0.5000, "recall": 0.5429, "f1_score": 0.5205, "support": 35},
        "neutral": {"precision": 0.4000, "recall": 0.1250, "f1_score": 0.1905, "support": 16},
        "mixed": {"precision": 0.4091, "recall": 0.5625, "f1_score": 0.4737, "support": 16},
    },
    "categories": {
        "transliteration": 0.875,
        "typos": 0.750,
        "ordinary": 0.667,
        "bhai": 0.545,
        "mixed_sentiment": 0.538,
        "indirect_complaint": 0.500,
        "short": 0.500,
        "short_len<=5": 0.593,
        "hinglish": 0.486,
        "sarcasm": 0.250,
        "ambiguous": 0.200,
        "factual": 0.143,
        "polite_complaint": 0.000,
    },
    "languages": {
        "english": 0.472,
        "hinglish": 0.486,
    },
}


def evaluate_model_on_challenge(
    df: pd.DataFrame,
    model: Any,
    vectorizer: Any,
) -> Dict[str, Any]:
    """Run full evaluation on the challenge dataset."""
    X = df["text"].astype(str)
    y_true = df["sentiment"].str.strip().str.lower()

    X_vec = vectorizer.transform(X)
    y_pred = model.predict(X_vec)
    probs = model.predict_proba(X_vec)

    acc = float(accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    p_cls, r_cls, f1_cls, supp = precision_recall_fscore_support(
        y_true, y_pred, labels=TARGET_CLASSES, zero_division=0
    )
    per_class = {}
    for i, c in enumerate(TARGET_CLASSES):
        per_class[c] = {
            "precision": round(float(p_cls[i]), 4),
            "recall": round(float(r_cls[i]), 4),
            "f1_score": round(float(f1_cls[i]), 4),
            "support": int(supp[i]),
        }

    cm = confusion_matrix(y_true, y_pred, labels=TARGET_CLASSES)

    # Detailed error recording
    errors = []
    for idx in range(len(df)):
        if y_pred[idx] != y_true.iloc[idx]:
            max_prob = float(np.max(probs[idx]))
            row = df.iloc[idx]
            categories = CATEGORY_TAGS.get(row["id"], ["uncategorized"])
            errors.append({
                "id": row["id"],
                "text": row["text"],
                "language": row["language"],
                "actual": y_true.iloc[idx],
                "predicted": y_pred[idx],
                "confidence": round(max_prob, 4),
                "categories": categories,
            })

    # Category evaluation
    all_categories = sorted(set(t for tags in CATEGORY_TAGS.values() for t in tags))
    cat_results = {}
    for cat in all_categories:
        cat_ids = [k for k, tags in CATEGORY_TAGS.items() if cat in tags]
        mask = df["id"].isin(cat_ids)
        if mask.any():
            cat_acc = float(accuracy_score(y_true[mask], y_pred[mask]))
            tot = int(mask.sum())
            corr = int((y_true[mask] == y_pred[mask]).sum())
            cat_results[cat] = {
                "accuracy": round(cat_acc, 4),
                "total": tot,
                "correct": corr,
                "errors": tot - corr,
            }

    # Short <= 5 words slice
    short_len_mask = df["text"].str.split().str.len() <= 5
    short_len_acc = float(accuracy_score(y_true[short_len_mask], y_pred[short_len_mask]))
    short_len_tot = int(short_len_mask.sum())
    short_len_corr = int((y_true[short_len_mask] == y_pred[short_len_mask]).sum())
    cat_results["short_len<=5"] = {
        "accuracy": round(short_len_acc, 4),
        "total": short_len_tot,
        "correct": short_len_corr,
        "errors": short_len_tot - short_len_corr,
    }

    # Language breakdown
    lang_results = {}
    for lang in ["english", "hinglish"]:
        l_mask = df["language"].str.lower() == lang
        if l_mask.any():
            l_acc = float(accuracy_score(y_true[l_mask], y_pred[l_mask]))
            l_tot = int(l_mask.sum())
            l_corr = int((y_true[l_mask] == y_pred[l_mask]).sum())
            lang_results[lang] = {
                "accuracy": round(l_acc, 4),
                "total": l_tot,
                "correct": l_corr,
                "errors": l_tot - l_corr,
            }

    return {
        "overall": {
            "accuracy": round(acc, 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "macro_f1": round(float(f1_macro), 4),
            "weighted_precision": round(float(p_wt), 4),
            "weighted_recall": round(float(r_wt), 4),
            "weighted_f1": round(float(f1_wt), 4),
            "total_samples": len(df),
            "total_errors": len(errors),
        },
        "per_class": per_class,
        "confusion_matrix": cm.tolist(),
        "categories": cat_results,
        "languages": lang_results,
        "errors": errors,
        "predictions": y_pred.tolist(),
    }


def compare_with_old(
    df: pd.DataFrame,
    old_model: Any,
    old_vec: Any,
    new_results: Dict[str, Any],
) -> Dict[str, Any]:
    """Compare predictions on every challenge record."""
    X = df["text"].astype(str)
    y_true = df["sentiment"].str.strip().str.lower()
    old_preds = old_model.predict(old_vec.transform(X))
    new_preds = np.array(new_results["predictions"])

    fixed = []
    regressed = []
    still_error = []
    both_correct = []

    for i, row in df.iterrows():
        act = y_true.iloc[i]
        o_p = old_preds[i]
        n_p = new_preds[i]
        tid = row["id"]
        txt = row["text"]
        cats = CATEGORY_TAGS.get(tid, [])

        if o_p != act and n_p == act:
            fixed.append({"id": tid, "actual": act, "old_pred": o_p, "text": txt, "categories": cats})
        elif o_p == act and n_p != act:
            regressed.append({"id": tid, "actual": act, "new_pred": n_p, "text": txt, "categories": cats})
        elif o_p != act and n_p != act:
            still_error.append({"id": tid, "actual": act, "old_pred": o_p, "new_pred": n_p, "text": txt, "categories": cats})
        else:
            both_correct.append({"id": tid, "actual": act, "text": txt, "categories": cats})

    return {
        "fixed_count": len(fixed),
        "regressed_count": len(regressed),
        "still_error_count": len(still_error),
        "both_correct_count": len(both_correct),
        "fixed_examples": fixed,
        "regressed_examples": regressed,
        "still_error_examples": still_error,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate final model on challenge dataset.")
    base_dir = Path(__file__).resolve().parent.parent.parent
    parser.add_argument(
        "--challenge-dataset",
        type=Path,
        default=base_dir / "data" / "test" / "challenge_dataset.csv",
        help="Path to frozen challenge dataset",
    )
    parser.add_argument(
        "--final-model",
        type=Path,
        default=base_dir / "ml" / "models" / "sentiment_final_model.pkl",
        help="Path to retrained final model",
    )
    parser.add_argument(
        "--final-vectorizer",
        type=Path,
        default=base_dir / "ml" / "models" / "sentiment_final_vectorizer.pkl",
        help="Path to retrained final vectorizer",
    )
    parser.add_argument(
        "--old-model",
        type=Path,
        default=base_dir / "ml" / "models" / "sentiment_best_model.pkl",
        help="Path to Phase 5 best model",
    )
    parser.add_argument(
        "--old-vectorizer",
        type=Path,
        default=base_dir / "ml" / "models" / "sentiment_best_vectorizer.pkl",
        help="Path to Phase 5 best vectorizer",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=base_dir / "ml" / "models" / "final_challenge_evaluation.json",
        help="Path to output evaluation JSON",
    )
    args = parser.parse_args()

    print("=" * 78)
    print("PHASE 6.3: FINAL MODEL EVALUATION ON FROZEN CHALLENGE SET")
    print("=" * 78)

    if not args.challenge_dataset.is_file():
        print(f"ERROR: Challenge dataset not found: {args.challenge_dataset}", file=sys.stderr)
        return 1
    if not args.final_model.is_file() or not args.final_vectorizer.is_file():
        print(f"ERROR: Final model artifacts not found.", file=sys.stderr)
        return 1

    df_challenge = pd.read_csv(args.challenge_dataset)
    print(f"Loaded {len(df_challenge)} frozen challenge samples from {args.challenge_dataset.name}")

    final_model = joblib.load(args.final_model)
    final_vec = joblib.load(args.final_vectorizer)
    print(f"Loaded final model: {args.final_model.name}")
    print(f"Loaded final vectorizer: {args.final_vectorizer.name}")

    results = evaluate_model_on_challenge(df_challenge, final_model, final_vec)
    ov = results["overall"]

    print("-" * 78)
    print("EVALUATION 2 — FROZEN 90-RECORD CHALLENGE SET RESULTS:")
    print(f"  Accuracy:    {ov['accuracy']:.2%} ({ov['total_samples'] - ov['total_errors']}/{ov['total_samples']})  [Phase 6 Baseline: 47.8% (43/90)]")
    print(f"  Macro F1:    {ov['macro_f1']:.4f}               [Phase 6 Baseline: 0.4316]")
    print(f"  Weighted F1: {ov['weighted_f1']:.4f}            [Phase 6 Baseline: 0.4589]")
    print(f"  Total Errors:{ov['total_errors']} / {ov['total_samples']}                 [Phase 6 Baseline: 47 / 90]")
    print()

    print("PER-CLASS METRICS ON CHALLENGE SET:")
    print(f"{'Class':<10} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8} {'Phase 6 F1'}")
    print("-" * 65)
    for c in TARGET_CLASSES:
        pc = results["per_class"][c]
        b_f1 = PHASE6_BASELINE["per_class"][c]["f1_score"]
        print(f"{c:<10} {pc['precision']:<10.4f} {pc['recall']:<10.4f} {pc['f1_score']:<10.4f} {pc['support']:<8} {b_f1:.4f}")

    print()
    print("CONFUSION MATRIX ON CHALLENGE SET (rows=actual, cols=pred [positive, negative, neutral, mixed]):")
    for r in results["confusion_matrix"]:
        print(f"  {r}")

    print("-" * 78)
    print("EVALUATION 3 — CHALLENGE CATEGORY ANALYSIS:")
    print(f"{'Category':<22} {'Samples':<8} {'Old Acc':<10} {'New Acc':<10} {'Diff':<8} {'Status'}")
    print("-" * 68)

    category_display_map = [
        ("factual", "factual/neutral", PHASE6_BASELINE["categories"]["factual"]),
        ("sarcasm", "sarcasm", PHASE6_BASELINE["categories"]["sarcasm"]),
        ("bhai", "bhai", PHASE6_BASELINE["categories"]["bhai"]),
        ("indirect_complaint", "indirect complaints", PHASE6_BASELINE["categories"]["indirect_complaint"]),
        ("ambiguous", "ambiguous", PHASE6_BASELINE["categories"]["ambiguous"]),
        ("polite_complaint", "polite complaints", PHASE6_BASELINE["categories"]["polite_complaint"]),
        ("ordinary", "ordinary English", PHASE6_BASELINE["categories"]["ordinary"]),
        ("mixed_sentiment", "mixed clauses", PHASE6_BASELINE["categories"]["mixed_sentiment"]),
        ("hinglish", "Hinglish", PHASE6_BASELINE["categories"]["hinglish"]),
        ("typos", "typos", PHASE6_BASELINE["categories"]["typos"]),
        ("short", "short <=5 words (tag)", PHASE6_BASELINE["categories"]["short"]),
        ("short_len<=5", "short <=5 words (len)", PHASE6_BASELINE["categories"]["short_len<=5"]),
        ("transliteration", "transliteration", PHASE6_BASELINE["categories"]["transliteration"]),
    ]

    for key, disp_name, old_acc in category_display_map:
        if key in results["categories"]:
            cat_data = results["categories"][key]
            new_acc = cat_data["accuracy"]
            diff = new_acc - old_acc
            diff_str = f"{diff:+.1%}"
            status = "IMPROVED" if diff > 0.05 else ("REGRESSED" if diff < -0.05 else "NEUTRAL")
            print(f"{disp_name:<22} {cat_data['total']:<8} {old_acc:<10.1%} {new_acc:<10.1%} {diff_str:<8} {status}")

    print("-" * 78)
    print("EVALUATION 5 — CHALLENGE LANGUAGE PERFORMANCE:")
    for lang in ["english", "hinglish"]:
        l_res = results["languages"][lang]
        old_l = PHASE6_BASELINE["languages"][lang]
        diff = l_res["accuracy"] - old_l
        print(f"  {lang.capitalize():<10}: New={l_res['accuracy']:.2%} ({l_res['correct']}/{l_res['total']}) | Old={old_l:.2%} | Diff: {diff:+.1%}")

    # Detailed comparison with old model if available
    diff_analysis = {}
    if args.old_model.is_file() and args.old_vectorizer.is_file():
        old_model = joblib.load(args.old_model)
        old_vec = joblib.load(args.old_vectorizer)
        diff_analysis = compare_with_old(df_challenge, old_model, old_vec, results)
        print("-" * 78)
        print("MODEL TRANSITION COMPARISON (Old Phase 5 vs New Phase 6.3):")
        print(f"  Fixed Samples (Old Wrong -> New Correct):      {diff_analysis['fixed_count']}")
        print(f"  Regressed Samples (Old Correct -> New Wrong):   {diff_analysis['regressed_count']}")
        print(f"  Consistently Correct (Both Correct):            {diff_analysis['both_correct_count']}")
        print(f"  Persistent Errors (Still Incorrect):            {diff_analysis['still_error_count']}")
        print(f"  Net Correct Improvement:                        +{diff_analysis['fixed_count'] - diff_analysis['regressed_count']} samples")

    # Save output JSON
    output_data = {
        "final_evaluation": results,
        "transition_analysis": diff_analysis,
        "phase6_baseline": PHASE6_BASELINE,
    }
    with open(args.output_json, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print("=" * 78)
    print(f"Saved evaluation results to: {args.output_json}")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
