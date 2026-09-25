#!/usr/bin/env python3
"""
Final Model Evaluation on Frozen Challenge Dataset (Phase 6.6).

Evaluates the retrained final model (sentiment_final_model.pkl trained on 8,000 records)
on the frozen 90-record challenge dataset (data/test/challenge_dataset.csv) and compares
directly against Phase 5 (5k Exp3) and Phase 6.3 (6k Exp3) performance.

Evaluations Reported:
1. Overall accuracy, macro F1, weighted F1, total errors
2. Per-class precision, recall, F1-score
3. Confusion matrix
4. Category-specific performance across all 13 categories/slices:
   - sarcasm
   - factual/neutral
   - bhai/conversational
   - indirect complaints
   - ambiguous
   - polite complaints
   - Hinglish
   - ordinary English
   - mixed clauses
   - transliteration
   - short tagged
   - short length <=5 words
   - typos
5. Language performance on challenge set (English vs Hinglish)
6. 3-Way Model Comparison Table (5k vs 6k vs 8k)
7. Transition & regression analysis against previous 6k model

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

# Challenge category mapping (identical to Phase 6 / 6.3)
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

# Previous Phase 5 Exp3 (5k dataset) challenge metrics
PHASE5_EXP3_BASELINE = {
    "overall": {
        "accuracy": 0.4778,
        "macro_f1": 0.4316,
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
        "sarcasm": 0.250,
        "factual": 0.143,
        "bhai": 0.545,
        "indirect_complaint": 0.500,
        "ambiguous": 0.200,
        "polite_complaint": 0.000,
        "hinglish": 0.486,
        "ordinary": 0.667,
        "mixed_sentiment": 0.538,
        "transliteration": 0.875,
        "short": 0.500,
        "short_len<=5": 0.593,
        "typos": 0.750,
    },
    "languages": {
        "english": 0.472,
        "hinglish": 0.486,
    },
}

# Phase 6.3 (6k dataset) challenge metrics
PHASE6_3_BASELINE = {
    "overall": {
        "accuracy": 0.6667,
        "macro_f1": 0.6688,
        "weighted_f1": 0.6669,
        "total_errors": 30,
    },
    "per_class": {
        "positive": {"precision": 0.7647, "recall": 0.5652, "f1_score": 0.6500, "support": 23},
        "negative": {"precision": 0.6047, "recall": 0.7429, "f1_score": 0.6667, "support": 35},
        "neutral": {"precision": 0.7857, "recall": 0.6875, "f1_score": 0.7333, "support": 16},
        "mixed": {"precision": 0.6250, "recall": 0.6250, "f1_score": 0.6250, "support": 16},
    },
    "categories": {
        "sarcasm": 1.000,
        "factual": 0.857,
        "bhai": 0.909,
        "indirect_complaint": 0.750,
        "ambiguous": 0.400,
        "polite_complaint": 0.200,
        "hinglish": 0.649,
        "ordinary": 0.778,
        "mixed_sentiment": 0.615,
        "transliteration": 0.750,
        "short": 0.500,
        "short_len<=5": 0.593,
        "typos": 0.750,
    },
    "languages": {
        "english": 0.679,
        "hinglish": 0.649,
    },
}

# Exact predictions from Phase 6.3 (6k model) on the 90 challenge samples
PREDICTIONS_6K = {
    "CH001": "positive", "CH002": "negative", "CH003": "positive", "CH004": "negative",
    "CH005": "neutral", "CH006": "mixed", "CH007": "mixed", "CH008": "neutral",
    "CH009": "negative", "CH010": "positive", "CH011": "positive", "CH012": "positive",
    "CH013": "negative", "CH014": "negative", "CH015": "positive", "CH016": "negative",
    "CH017": "neutral", "CH018": "negative", "CH019": "negative", "CH020": "negative",
    "CH021": "negative", "CH022": "neutral", "CH023": "mixed", "CH024": "negative",
    "CH025": "mixed", "CH026": "mixed", "CH027": "negative", "CH028": "negative",
    "CH029": "negative", "CH030": "negative", "CH031": "negative", "CH032": "mixed",
    "CH033": "mixed", "CH034": "neutral", "CH035": "positive", "CH036": "negative",
    "CH037": "neutral", "CH038": "positive", "CH039": "positive", "CH040": "negative",
    "CH041": "positive", "CH042": "positive", "CH043": "negative", "CH044": "negative",
    "CH045": "negative", "CH046": "neutral", "CH047": "neutral", "CH048": "neutral",
    "CH049": "positive", "CH050": "negative", "CH051": "mixed", "CH052": "mixed",
    "CH053": "negative", "CH054": "positive", "CH055": "neutral", "CH056": "positive",
    "CH057": "negative", "CH058": "negative", "CH059": "negative", "CH060": "negative",
    "CH061": "mixed", "CH062": "negative", "CH063": "mixed", "CH064": "mixed",
    "CH065": "positive", "CH066": "negative", "CH067": "negative", "CH068": "negative",
    "CH069": "negative", "CH070": "negative", "CH071": "positive", "CH072": "negative",
    "CH073": "neutral", "CH074": "mixed", "CH075": "neutral", "CH076": "negative",
    "CH077": "mixed", "CH078": "mixed", "CH079": "positive", "CH080": "neutral",
    "CH081": "negative", "CH082": "mixed", "CH083": "negative", "CH084": "negative",
    "CH085": "neutral", "CH086": "negative", "CH087": "negative", "CH088": "negative",
    "CH089": "negative", "CH090": "negative"
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


def compare_with_6k(
    df: pd.DataFrame,
    new_results: Dict[str, Any],
) -> Dict[str, Any]:
    """Compare 8k predictions with previous 6k model predictions on every challenge record."""
    y_true = df["sentiment"].str.strip().str.lower()
    new_preds = np.array(new_results["predictions"])

    fixed = []
    regressed = []
    still_error = []
    both_correct = []

    for i, row in df.iterrows():
        act = y_true.iloc[i]
        tid = row["id"]
        o_p = PREDICTIONS_6K.get(tid, "unknown")
        n_p = new_preds[i]
        txt = row["text"]
        cats = CATEGORY_TAGS.get(tid, [])

        if o_p != act and n_p == act:
            fixed.append({"id": tid, "actual": act, "old_6k_pred": o_p, "new_8k_pred": n_p, "text": txt, "categories": cats})
        elif o_p == act and n_p != act:
            regressed.append({"id": tid, "actual": act, "old_6k_pred": o_p, "new_8k_pred": n_p, "text": txt, "categories": cats})
        elif o_p != act and n_p != act:
            still_error.append({"id": tid, "actual": act, "old_6k_pred": o_p, "new_8k_pred": n_p, "text": txt, "categories": cats})
        else:
            both_correct.append({"id": tid, "actual": act, "text": txt, "categories": cats})

    return {
        "fixed_count": len(fixed),
        "regressed_count": len(regressed),
        "still_error_count": len(still_error),
        "both_correct_count": len(both_correct),
        "net_improvement": len(fixed) - len(regressed),
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
        "--output-json",
        type=Path,
        default=base_dir / "ml" / "models" / "final_challenge_evaluation.json",
        help="Path to output evaluation JSON",
    )
    args = parser.parse_args()

    print("=" * 78)
    print("PHASE 6.6: FINAL 8,000-RECORD MODEL EVALUATION ON FROZEN CHALLENGE SET")
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

    # 6k transition analysis
    trans_6k = compare_with_6k(df_challenge, results)

    print("-" * 78)
    print("EVALUATION 1 — 3-WAY OVERALL CHALLENGE COMPARISON:")
    print(f"{'Metric':<20} {'5k Exp3 (Phase 5)':<20} {'6k Exp3 (Phase 6.3)':<20} {'8k Final (Phase 6.6)'}")
    print("-" * 78)
    print(f"{'Accuracy':<20} {'47.78% (43/90)':<20} {'66.67% (60/90)':<20} {ov['accuracy']:.2%} ({ov['total_samples'] - ov['total_errors']}/{ov['total_samples']})")
    print(f"{'Macro F1':<20} {'0.4316':<20} {'0.6688':<20} {ov['macro_f1']:.4f}")
    print(f"{'Weighted F1':<20} {'0.4589':<20} {'0.6669':<20} {ov['weighted_f1']:.4f}")
    print(f"{'Total Errors':<20} {'47 / 90':<20} {'30 / 90':<20} {ov['total_errors']} / {ov['total_samples']}")

    print()
    print("-" * 78)
    print("EVALUATION 2 — PER-CLASS METRICS (8k FINAL MODEL):")
    print(f"{'Class':<10} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8} {'6k F1':<10} {'5k F1'}")
    print("-" * 75)
    for c in TARGET_CLASSES:
        pc = results["per_class"][c]
        f1_6k = PHASE6_3_BASELINE["per_class"][c]["f1_score"]
        f1_5k = PHASE5_EXP3_BASELINE["per_class"][c]["f1_score"]
        print(f"{c:<10} {pc['precision']:<10.4f} {pc['recall']:<10.4f} {pc['f1_score']:<10.4f} {pc['support']:<8} {f1_6k:<10.4f} {f1_5k:.4f}")

    print()
    print("CONFUSION MATRIX ON CHALLENGE SET (rows=actual, cols=pred [positive, negative, neutral, mixed]):")
    for r in results["confusion_matrix"]:
        print(f"  {r}")

    print("-" * 78)
    print("EVALUATION 3 — CHALLENGE CATEGORY 3-WAY COMPARISON:")
    print(f"{'Category':<22} {'Samples':<8} {'5k Exp3':<10} {'6k Exp3':<10} {'8k Final':<10} {'vs 6k Diff':<10}")
    print("-" * 78)

    category_display_map = [
        ("sarcasm", "sarcasm", PHASE5_EXP3_BASELINE["categories"]["sarcasm"], PHASE6_3_BASELINE["categories"]["sarcasm"]),
        ("factual", "factual/neutral", PHASE5_EXP3_BASELINE["categories"]["factual"], PHASE6_3_BASELINE["categories"]["factual"]),
        ("bhai", "bhai/conversational", PHASE5_EXP3_BASELINE["categories"]["bhai"], PHASE6_3_BASELINE["categories"]["bhai"]),
        ("indirect_complaint", "indirect complaints", PHASE5_EXP3_BASELINE["categories"]["indirect_complaint"], PHASE6_3_BASELINE["categories"]["indirect_complaint"]),
        ("ambiguous", "ambiguous", PHASE5_EXP3_BASELINE["categories"]["ambiguous"], PHASE6_3_BASELINE["categories"]["ambiguous"]),
        ("polite_complaint", "polite complaints", PHASE5_EXP3_BASELINE["categories"]["polite_complaint"], PHASE6_3_BASELINE["categories"]["polite_complaint"]),
        ("hinglish", "Hinglish", PHASE5_EXP3_BASELINE["categories"]["hinglish"], PHASE6_3_BASELINE["categories"]["hinglish"]),
        ("ordinary", "ordinary English", PHASE5_EXP3_BASELINE["categories"]["ordinary"], PHASE6_3_BASELINE["categories"]["ordinary"]),
        ("mixed_sentiment", "mixed clauses", PHASE5_EXP3_BASELINE["categories"]["mixed_sentiment"], PHASE6_3_BASELINE["categories"]["mixed_sentiment"]),
        ("transliteration", "transliteration", PHASE5_EXP3_BASELINE["categories"]["transliteration"], PHASE6_3_BASELINE["categories"]["transliteration"]),
        ("short", "short tagged", PHASE5_EXP3_BASELINE["categories"]["short"], PHASE6_3_BASELINE["categories"]["short"]),
        ("short_len<=5", "short len <= 5", PHASE5_EXP3_BASELINE["categories"]["short_len<=5"], PHASE6_3_BASELINE["categories"]["short_len<=5"]),
        ("typos", "typos", PHASE5_EXP3_BASELINE["categories"]["typos"], PHASE6_3_BASELINE["categories"]["typos"]),
    ]

    for key, disp_name, c_5k, c_6k in category_display_map:
        if key in results["categories"]:
            cat_data = results["categories"][key]
            c_8k = cat_data["accuracy"]
            diff = c_8k - c_6k
            diff_str = f"{diff:+.1%}"
            print(f"{disp_name:<22} {cat_data['total']:<8} {c_5k:<10.1%} {c_6k:<10.1%} {c_8k:<10.1%} {diff_str:<10}")

    print("-" * 78)
    print("EVALUATION 4 — CHALLENGE LANGUAGE PERFORMANCE:")
    for lang in ["english", "hinglish"]:
        l_res = results["languages"][lang]
        l_6k = PHASE6_3_BASELINE["languages"][lang]
        l_5k = PHASE5_EXP3_BASELINE["languages"][lang]
        diff_6k = l_res["accuracy"] - l_6k
        print(f"  {lang.capitalize():<10}: 8k={l_res['accuracy']:.2%} ({l_res['correct']}/{l_res['total']}) | 6k={l_6k:.2%} | 5k={l_5k:.2%} | vs 6k: {diff_6k:+.1%}")

    print("-" * 78)
    print("EVALUATION 5 — 6k -> 8k TRANSITION & REGRESSION ANALYSIS:")
    print(f"  Fixed Samples (6k Wrong -> 8k Correct):       {trans_6k['fixed_count']}")
    print(f"  Regressed Samples (6k Correct -> 8k Wrong):    {trans_6k['regressed_count']}")
    print(f"  Consistently Correct (Both Correct):           {trans_6k['both_correct_count']}")
    print(f"  Persistent Errors (Both Incorrect):            {trans_6k['still_error_count']}")
    print(f"  Net Correct Improvement:                       {trans_6k['net_improvement']:+d} samples")

    if trans_6k["fixed_examples"]:
        print("\n  Sample Fixed Records (6k Wrong -> 8k Correct):")
        for fix in trans_6k["fixed_examples"][:5]:
            print(f"    [{fix['id']}] act={fix['actual']} | 6k_pred={fix['old_6k_pred']} | text=\"{fix['text']}\"")

    if trans_6k["regressed_examples"]:
        print("\n  Sample Regressed Records (6k Correct -> 8k Wrong):")
        for reg in trans_6k["regressed_examples"][:5]:
            print(f"    [{reg['id']}] act={reg['actual']} | 8k_pred={reg['new_8k_pred']} | text=\"{reg['text']}\"")

    # Save output JSON
    output_data = {
        "evaluation_phase": "Phase 6.6 (8,000 records)",
        "final_evaluation": results,
        "transition_from_6k": trans_6k,
        "phase5_exp3_baseline": PHASE5_EXP3_BASELINE,
        "phase6_3_baseline": PHASE6_3_BASELINE,
    }
    with open(args.output_json, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print("=" * 78)
    print(f"Saved evaluation results to: {args.output_json}")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
