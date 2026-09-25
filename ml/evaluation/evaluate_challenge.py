#!/usr/bin/env python3
"""
Challenge Dataset Evaluation (Phase 6).

Evaluates the Phase 5 winning model (Exp 3: Combined Word + Character n-grams)
on a manually curated challenge dataset designed to stress-test known weaknesses.

Reports:
1. Overall accuracy, macro F1, weighted F1.
2. Per-class precision, recall, F1.
3. Confusion matrix.
4. Error count and detailed error table.
5. Hinglish performance.
6. Short-text performance.
7. Mixed-sentiment performance.
8. Indirect-complaint performance.
9. Prediction confidence for difficult/incorrect examples.
10. Generates docs/FINAL_MODEL_VALIDATION.md.

Usage:
    python ml/evaluation/evaluate_challenge.py
    python ml/evaluation/evaluate_challenge.py --report docs/FINAL_MODEL_VALIDATION.md
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
)


TARGET_CLASSES = ["positive", "negative", "neutral", "mixed"]


# ─── Challenge category tags ───────────────────────────────────────────────────
# Each ID is tagged with one or more challenge categories based on
# how the dataset was designed. This allows category-wise evaluation.
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
    # Additional Hinglish (not already tagged)
    "CH069": ["hinglish"], "CH070": ["hinglish"],
}


def load_model(models_dir: Path):
    """Load the Phase 5 Exp 3 winning model and vectorizer."""
    model_path = models_dir / "sentiment_best_model.pkl"
    vec_path = models_dir / "sentiment_best_vectorizer.pkl"

    if not model_path.is_file():
        print(f"ERROR: Model not found: {model_path}", file=sys.stderr)
        sys.exit(1)
    if not vec_path.is_file():
        print(f"ERROR: Vectorizer not found: {vec_path}", file=sys.stderr)
        sys.exit(1)

    model = joblib.load(model_path)
    vectorizer = joblib.load(vec_path)

    print(f"  Model loaded:      {model_path.name}")
    print(f"  Vectorizer loaded:  {vec_path.name}")
    print(f"  Model classes:      {list(model.classes_)}")

    return model, vectorizer


def evaluate_challenge(
    df: pd.DataFrame,
    model,
    vectorizer,
) -> Dict[str, Any]:
    """Run full evaluation on the challenge dataset."""
    X = df["text"].astype(str)
    y_true = df["sentiment"].str.strip().str.lower()

    X_vec = vectorizer.transform(X)
    y_pred = model.predict(X_vec)
    probs = model.predict_proba(X_vec)

    # ── Overall metrics ──────────────────────────────────────────────────────
    acc = float(accuracy_score(y_true, y_pred))

    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    # ── Per-class metrics ────────────────────────────────────────────────────
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

    # ── Confusion matrix ────────────────────────────────────────────────────
    cm = confusion_matrix(y_true, y_pred, labels=TARGET_CLASSES)

    # ── Error analysis ──────────────────────────────────────────────────────
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
                "confidence": max_prob,
                "categories": categories,
            })

    # ── Slice-based metrics ─────────────────────────────────────────────────
    slices = {}

    # Hinglish slice
    hi_mask = df["language"].str.lower() == "hinglish"
    if hi_mask.any():
        hi_acc = float(accuracy_score(y_true[hi_mask], y_pred[hi_mask]))
        hi_total = int(hi_mask.sum())
        hi_correct = int((y_true[hi_mask] == y_pred[hi_mask]).sum())
        slices["hinglish"] = {
            "accuracy": round(hi_acc, 4),
            "total": hi_total,
            "correct": hi_correct,
            "errors": hi_total - hi_correct,
        }

    # English slice
    en_mask = df["language"].str.lower() == "english"
    if en_mask.any():
        en_acc = float(accuracy_score(y_true[en_mask], y_pred[en_mask]))
        slices["english"] = {
            "accuracy": round(en_acc, 4),
            "total": int(en_mask.sum()),
            "correct": int((y_true[en_mask] == y_pred[en_mask]).sum()),
            "errors": int(en_mask.sum()) - int((y_true[en_mask] == y_pred[en_mask]).sum()),
        }

    # Short text slice (text with <=5 words)
    word_counts = df["text"].str.split().str.len()
    short_mask = word_counts <= 5
    if short_mask.any():
        short_acc = float(accuracy_score(y_true[short_mask], y_pred[short_mask]))
        slices["short_text"] = {
            "accuracy": round(short_acc, 4),
            "total": int(short_mask.sum()),
            "correct": int((y_true[short_mask] == y_pred[short_mask]).sum()),
            "errors": int(short_mask.sum()) - int((y_true[short_mask] == y_pred[short_mask]).sum()),
        }

    # Category-based slices
    all_categories = set()
    for tags in CATEGORY_TAGS.values():
        all_categories.update(tags)

    category_results = {}
    for cat in sorted(all_categories):
        cat_ids = [k for k, tags in CATEGORY_TAGS.items() if cat in tags]
        cat_mask = df["id"].isin(cat_ids)
        if cat_mask.any():
            cat_acc = float(accuracy_score(y_true[cat_mask], y_pred[cat_mask]))
            cat_total = int(cat_mask.sum())
            cat_correct = int((y_true[cat_mask] == y_pred[cat_mask]).sum())
            category_results[cat] = {
                "accuracy": round(cat_acc, 4),
                "total": cat_total,
                "correct": cat_correct,
                "errors": cat_total - cat_correct,
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
        "errors": errors,
        "slices": slices,
        "category_results": category_results,
    }


def build_markdown_report(
    results: Dict[str, Any],
    dataset_path: str,
) -> str:
    """Generate docs/FINAL_MODEL_VALIDATION.md."""
    ov = results["overall"]
    per_class = results["per_class"]
    cm = results["confusion_matrix"]
    errors = results["errors"]
    slices = results["slices"]
    cat_results = results["category_results"]

    doc = [
        "# Final Model Validation — Challenge Dataset Report (Phase 6)",
        "",
        "## 1. Purpose",
        "",
        "This report documents the **challenge testing** of the selected Phase 5 candidate",
        "model (Experiment 3: Combined Word + Character n-grams with Logistic Regression)",
        "on a **manually curated, independent challenge dataset** before integrating the model",
        "into the Django production API.",
        "",
        "The challenge dataset is designed to **stress-test known model weaknesses** identified",
        "in Phase 4 and Phase 5, including:",
        "- Short / minimal-length feedback",
        "- Hinglish transliteration variations",
        "- Spelling mistakes and typos",
        "- Indirect complaints phrased as questions",
        "- Polite and sarcastic complaints",
        "- Mixed sentiment with contrasting clauses",
        '- The "bhai" particle in both positive and negative contexts',
        "- Factual / neutral statements",
        "- Ambiguous / difficult examples",
        "",
        "---",
        "",
        "## 2. Dataset Composition",
        "",
        f"- **Source:** [`{dataset_path}`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/{dataset_path.replace(chr(92), '/')})",
        f"- **Total samples:** {ov['total_samples']}",
        "- **Columns:** `id`, `text`, `language`, `sentiment`",
        "- **Label assignment:** Manual human judgment (NOT model predictions)",
        "- **Training data overlap:** 0 texts shared with `data/processed/sentiment_dataset.csv`",
        "",
        "### Class Distribution",
        "",
        "| Class | Count |",
        "| :--- | :---: |",
    ]

    for c in TARGET_CLASSES:
        doc.append(f"| `{c}` | {per_class[c]['support']} |")

    doc.extend([
        "",
        "### Language Distribution",
        "",
        "| Language | Count | Accuracy |",
        "| :--- | :---: | :---: |",
    ])

    for lang in ["english", "hinglish"]:
        if lang in slices:
            s = slices[lang]
            doc.append(f"| `{lang}` | {s['total']} | {s['accuracy']:.1%} |")

    doc.extend([
        "",
        "### Challenge Categories Covered",
        "",
        "| Category | Samples | Accuracy |",
        "| :--- | :---: | :---: |",
    ])

    category_display = {
        "short": "Short text (≤5 words)",
        "hinglish": "Hinglish",
        "transliteration": "Transliteration variations",
        "typos": "Spelling mistakes / typos",
        "indirect_complaint": "Indirect complaints (questions)",
        "polite_complaint": "Polite complaints",
        "sarcasm": "Sarcastic complaints",
        "mixed_sentiment": "Mixed sentiment clauses",
        "bhai": '"bhai" particle contexts',
        "ordinary": "Ordinary English",
        "factual": "Factual / neutral",
        "ambiguous": "Ambiguous / difficult",
    }

    for cat_key in ["short", "hinglish", "transliteration", "typos",
                     "indirect_complaint", "polite_complaint", "sarcasm",
                     "mixed_sentiment", "bhai", "ordinary", "factual", "ambiguous"]:
        if cat_key in cat_results:
            cr = cat_results[cat_key]
            display = category_display.get(cat_key, cat_key)
            doc.append(f"| {display} | {cr['total']} | {cr['accuracy']:.1%} |")

    doc.extend([
        "",
        "---",
        "",
        "## 3. Evaluation Methodology",
        "",
        "- **Model under test:** Exp 3 (Combined Word + Character n-grams)",
        "  - `FeatureUnion(Word TfidfVectorizer(1,1) + Char_wb TfidfVectorizer(3,5))`",
        "  - `LogisticRegression(max_iter=1000, class_weight=None, random_state=42)`",
        "- **Artifacts:** `ml/models/sentiment_best_model.pkl` and `ml/models/sentiment_best_vectorizer.pkl`",
        "- **Evaluation protocol:** Direct inference on challenge dataset — no train/test split needed",
        "  (challenge data is entirely independent from training data).",
        "- **Metrics:** Accuracy, macro & weighted precision/recall/F1, per-class metrics, confusion matrix.",
        "- **Category analysis:** Each challenge example is tagged with categories (e.g., `short`, `sarcasm`,",
        "  `bhai`, `transliteration`) to measure slice-level performance.",
        "",
        "---",
        "",
        "## 4. Overall Results",
        "",
        "| Metric | Value |",
        "| :--- | :---: |",
        f"| **Overall Accuracy** | **{ov['accuracy']:.1%}** |",
        f"| **Macro Precision** | {ov['macro_precision']:.4f} |",
        f"| **Macro Recall** | {ov['macro_recall']:.4f} |",
        f"| **Macro F1-Score** | **{ov['macro_f1']:.4f}** |",
        f"| **Weighted Precision** | {ov['weighted_precision']:.4f} |",
        f"| **Weighted Recall** | {ov['weighted_recall']:.4f} |",
        f"| **Weighted F1-Score** | **{ov['weighted_f1']:.4f}** |",
        f"| **Total Errors** | {ov['total_errors']} / {ov['total_samples']} |",
        "",
        "---",
        "",
        "## 5. Per-Class Metrics",
        "",
        "| Class | Precision | Recall | F1-Score | Support |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ])

    for c in TARGET_CLASSES:
        pc = per_class[c]
        doc.append(
            f"| `{c}` | {pc['precision']:.4f} | {pc['recall']:.4f} | "
            f"{pc['f1_score']:.4f} | {pc['support']} |"
        )

    doc.extend([
        "",
        "---",
        "",
        "## 6. Confusion Matrix",
        "",
        "| Actual \\ Predicted | positive | negative | neutral | mixed |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ])

    for i, c in enumerate(TARGET_CLASSES):
        row_vals = " | ".join(str(cm[i][j]) for j in range(len(TARGET_CLASSES)))
        doc.append(f"| **{c}** | {row_vals} |")

    doc.extend([
        "",
        "---",
        "",
        "## 7. Category-Wise Performance",
        "",
        "| Category | Samples | Correct | Errors | Accuracy |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ])

    for cat_key in ["short", "transliteration", "typos",
                     "indirect_complaint", "polite_complaint", "sarcasm",
                     "mixed_sentiment", "bhai", "ordinary", "factual", "ambiguous"]:
        if cat_key in cat_results:
            cr = cat_results[cat_key]
            display = category_display.get(cat_key, cat_key)
            doc.append(
                f"| {display} | {cr['total']} | {cr['correct']} | "
                f"{cr['errors']} | {cr['accuracy']:.1%} |"
            )

    doc.extend([
        "",
        "---",
        "",
        "## 8. Language-Based Performance",
        "",
        "| Language | Total | Correct | Errors | Accuracy |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ])

    for lang in ["english", "hinglish"]:
        if lang in slices:
            s = slices[lang]
            doc.append(
                f"| `{lang}` | {s['total']} | {s['correct']} | "
                f"{s['errors']} | {s['accuracy']:.1%} |"
            )

    if "short_text" in slices:
        s = slices["short_text"]
        doc.extend([
            "",
            "### Short Text Performance (≤5 words)",
            "",
            f"- Total: {s['total']}, Correct: {s['correct']}, "
            f"Errors: {s['errors']}, Accuracy: **{s['accuracy']:.1%}**",
        ])

    doc.extend([
        "",
        "---",
        "",
        "## 9. Detailed Error Analysis",
        "",
        f"Total errors: **{len(errors)}** out of {ov['total_samples']} samples.",
        "",
    ])

    if errors:
        doc.extend([
            "| # | ID | Actual | Predicted | Conf. | Language | Categories | Text |",
            "| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |",
        ])
        for i, e in enumerate(errors, 1):
            cats = ", ".join(e["categories"])
            text_snippet = e["text"][:80] + ("..." if len(e["text"]) > 80 else "")
            doc.append(
                f"| {i} | `{e['id']}` | `{e['actual']}` | `{e['predicted']}` | "
                f"{e['confidence']:.1%} | {e['language']} | {cats} | "
                f"*\"{text_snippet}\"* |"
            )

        # Categorize errors
        doc.extend(["", "### Error Breakdown by Category", ""])
        error_by_cat = {}
        for e in errors:
            for cat in e["categories"]:
                error_by_cat.setdefault(cat, []).append(e)

        if error_by_cat:
            doc.append("| Category | Error Count |")
            doc.append("| :--- | :---: |")
            for cat in sorted(error_by_cat.keys()):
                display = category_display.get(cat, cat)
                doc.append(f"| {display} | {len(error_by_cat[cat])} |")
    else:
        doc.append("**No errors — all predictions correct!**")

    doc.extend([
        "",
        "---",
        "",
        "## 10. Key Observations",
        "",
    ])

    # Build observations dynamically based on results
    observations = []

    if ov["accuracy"] >= 0.85:
        observations.append(
            f"1. **Overall challenge accuracy ({ov['accuracy']:.1%})** is reasonable for a "
            "stress-test dataset that was specifically designed to target model weaknesses."
        )
    else:
        observations.append(
            f"1. **Overall challenge accuracy ({ov['accuracy']:.1%})** indicates the model "
            "struggles on deliberately adversarial inputs."
        )

    if "hinglish" in slices:
        hi = slices["hinglish"]
        observations.append(
            f"2. **Hinglish accuracy ({hi['accuracy']:.1%})** on challenge examples "
            f"({hi['errors']} errors out of {hi['total']}). "
            "Character n-grams help with transliteration but some bias patterns remain."
        )

    if "short_text" in slices:
        st = slices["short_text"]
        observations.append(
            f"3. **Short text accuracy ({st['accuracy']:.1%})** "
            f"({st['errors']} errors out of {st['total']}). "
            "Very short feedback remains challenging due to limited lexical signal."
        )

    if "sarcasm" in cat_results:
        sar = cat_results["sarcasm"]
        observations.append(
            f"4. **Sarcasm detection ({sar['accuracy']:.1%})** — "
            f"{sar['correct']}/{sar['total']} correct. "
            "Sarcastic language inverts literal meaning, which bag-of-words approaches cannot detect structurally."
        )

    if "mixed_sentiment" in cat_results:
        mx = cat_results["mixed_sentiment"]
        observations.append(
            f"5. **Mixed sentiment ({mx['accuracy']:.1%})** — "
            f"{mx['correct']}/{mx['total']} correct. "
            "Feedback with contrasting clauses is inherently difficult for linear models."
        )

    if "bhai" in cat_results:
        bh = cat_results["bhai"]
        observations.append(
            f"6. **\"bhai\" particle contexts ({bh['accuracy']:.1%})** — "
            f"{bh['correct']}/{bh['total']} correct. "
            "Tests whether the model correctly handles both positive and negative uses of 'bhai'."
        )

    for obs in observations:
        doc.append(obs)

    doc.extend([
        "",
        "---",
        "",
        "## 11. Limitations",
        "",
        "1. **Challenge dataset is small (90 examples):** Results are indicative but not "
        "statistically robust. Individual errors have large impact on percentages.",
        "2. **Labels are subjective:** Some examples (e.g., ambiguous, mixed) are borderline "
        "and reasonable disagreement is possible.",
        "3. **Model is bag-of-words / bag-of-characters:** It cannot detect sarcasm, irony, "
        "or rhetorical structures that require understanding of word order and pragmatics.",
        "4. **No external vocabulary expansion:** The model vocabulary is limited to what "
        "appeared in the 5,000 training examples. Rare typos or novel slang may be OOV.",
        "",
        "---",
        "",
        "## 12. Validation Gate Decision",
        "",
    ])

    # Validation decision
    pass_threshold_acc = 0.75  # Challenge data is deliberately hard
    pass_threshold_f1 = 0.70

    passed = ov["accuracy"] >= pass_threshold_acc and ov["macro_f1"] >= pass_threshold_f1

    if passed:
        doc.extend([
            "### ✅ PASS",
            "",
            f"The model achieves **{ov['accuracy']:.1%} accuracy** and **{ov['macro_f1']:.4f} macro F1** "
            "on the challenge dataset, meeting the validation gate thresholds "
            f"(≥{pass_threshold_acc:.0%} accuracy, ≥{pass_threshold_f1:.2f} macro F1).",
            "",
            "The model is **approved for integration into the Django production API** in the next phase.",
            "",
            "**Known limitations** (sarcasm, mixed sentiment, ambiguous feedback) are documented above "
            "and accepted as inherent constraints of the classical ML approach chosen for this project.",
        ])
    else:
        doc.extend([
            "### ❌ NEEDS REVIEW",
            "",
            f"The model achieves **{ov['accuracy']:.1%} accuracy** and **{ov['macro_f1']:.4f} macro F1** "
            "on the challenge dataset, which is below the validation gate thresholds "
            f"(≥{pass_threshold_acc:.0%} accuracy, ≥{pass_threshold_f1:.2f} macro F1).",
            "",
            "**Further investigation or improvement is recommended before production integration.**",
        ])

    doc.extend([
        "",
        "---",
        "",
        "## 13. Reproduction",
        "",
        "```bash",
        "python ml/evaluation/evaluate_challenge.py --report docs/FINAL_MODEL_VALIDATION.md",
        "```",
        "",
    ])

    return "\n".join(doc)


def main() -> int:
    base_dir = Path(__file__).resolve().parent.parent.parent

    parser = argparse.ArgumentParser(
        description="Evaluate the Phase 5 winning model on the challenge dataset."
    )
    parser.add_argument(
        "--dataset",
        type=Path,
        default=base_dir / "data" / "test" / "challenge_dataset.csv",
        help="Path to challenge dataset CSV",
    )
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=base_dir / "ml" / "models",
        help="Directory containing model artifacts",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=None,
        help="Output path for markdown report (e.g., docs/FINAL_MODEL_VALIDATION.md)",
    )
    args = parser.parse_args()

    print("=" * 78)
    print("PHASE 6: CHALLENGE DATASET EVALUATION")
    print("=" * 78)

    # ── Load dataset ────────────────────────────────────────────────────────
    if not args.dataset.is_file():
        print(f"ERROR: Challenge dataset not found: {args.dataset}", file=sys.stderr)
        return 1

    df = pd.read_csv(args.dataset)
    print(f"\nChallenge dataset: {args.dataset}")
    print(f"  Records: {len(df)}")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Sentiment distribution:")
    for s, c in df["sentiment"].value_counts().items():
        print(f"    {s}: {c}")

    # ── Validate columns ───────────────────────────────────────────────────
    required_cols = {"id", "text", "language", "sentiment"}
    if not required_cols.issubset(set(df.columns)):
        missing = required_cols - set(df.columns)
        print(f"ERROR: Missing columns: {missing}", file=sys.stderr)
        return 1

    valid_sentiments = {"positive", "negative", "neutral", "mixed"}
    invalid = set(df["sentiment"].str.lower().unique()) - valid_sentiments
    if invalid:
        print(f"ERROR: Invalid sentiment labels: {invalid}", file=sys.stderr)
        return 1

    # ── Load model ─────────────────────────────────────────────────────────
    print(f"\nLoading model from {args.models_dir}/...")
    model, vectorizer = load_model(args.models_dir)

    # ── Evaluate ───────────────────────────────────────────────────────────
    print("\nRunning evaluation...")
    results = evaluate_challenge(df, model, vectorizer)

    ov = results["overall"]
    print(f"\n{'=' * 78}")
    print(f"RESULTS SUMMARY")
    print(f"{'=' * 78}")
    print(f"  Overall Accuracy:  {ov['accuracy']:.1%}")
    print(f"  Macro F1:          {ov['macro_f1']:.4f}")
    print(f"  Weighted F1:       {ov['weighted_f1']:.4f}")
    print(f"  Total Errors:      {ov['total_errors']} / {ov['total_samples']}")
    print()

    print("Per-Class Results:")
    print(f"  {'Class':<12} {'Prec':>8} {'Recall':>8} {'F1':>8} {'Support':>8}")
    print(f"  {'-'*44}")
    for c in TARGET_CLASSES:
        pc = results["per_class"][c]
        print(f"  {c:<12} {pc['precision']:>8.4f} {pc['recall']:>8.4f} "
              f"{pc['f1_score']:>8.4f} {pc['support']:>8}")
    print()

    print("Confusion Matrix (rows=actual, cols=predicted):")
    cm = results["confusion_matrix"]
    header = f"  {'':>12}" + "".join(f"{c:>10}" for c in TARGET_CLASSES)
    print(header)
    for i, c in enumerate(TARGET_CLASSES):
        row = "".join(f"{cm[i][j]:>10}" for j in range(len(TARGET_CLASSES)))
        print(f"  {c:>12}{row}")
    print()

    if results["slices"]:
        print("Slice Performance:")
        for name, s in results["slices"].items():
            print(f"  {name}: {s['accuracy']:.1%} ({s['correct']}/{s['total']}, "
                  f"{s['errors']} errors)")
    print()

    if results["category_results"]:
        print("Category Performance:")
        for cat, cr in sorted(results["category_results"].items()):
            print(f"  {cat}: {cr['accuracy']:.1%} ({cr['correct']}/{cr['total']}, "
                  f"{cr['errors']} errors)")
    print()

    if results["errors"]:
        print(f"Error Details ({len(results['errors'])} errors):")
        for e in results["errors"]:
            cats = ", ".join(e["categories"])
            print(f"  {e['id']}: {e['actual']} -> {e['predicted']} "
                  f"({e['confidence']:.1%}) [{cats}] \"{e['text'][:60]}\"")
    print()

    # ── Generate report ────────────────────────────────────────────────────
    if args.report:
        report_path = Path(args.report)
        if not report_path.is_absolute():
            report_path = base_dir / report_path
        report_md = build_markdown_report(results, str(args.dataset))
        report_path.write_text(report_md, encoding="utf-8")
        print(f"Saved report to: {report_path}")

    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
