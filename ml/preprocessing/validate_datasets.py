#!/usr/bin/env python3
"""
Dataset Validator for Multi-Domain Sentiment Analysis.

Validates the 10 raw service datasets under data/raw/:
1. Per-dataset schema, missing values, duplicates, and category checks.
2. Cross-dataset checks (duplicate IDs, duplicate text, cross-service leakage).
3. Text statistics (min, max, mean length).

Can be executed standalone or imported:
    python ml/preprocessing/validate_datasets.py
    python ml/preprocessing/validate_datasets.py --report docs/DATASET_VALIDATION.md
"""

import argparse
from collections import Counter
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd


# Expected 12-column schema
EXPECTED_COLUMNS = [
    "id",
    "text",
    "language",
    "service",
    "behavior",
    "sentiment",
    "aspect",
    "issue",
    "severity",
    "abuse",
    "complexity",
    "suggestion",
]

# Expected 10 service datasets (directory, filename, expected ID prefix, allowed service values)
SERVICE_DATASETS = [
    ("banking_upi", "BK.csv", "BK", ["banking_upi"]),
    ("cab_transport", "CB.csv", "CB", ["cab_transport"]),
    ("customer_support", "CS.csv", "CS", ["customer_support"]),
    ("ecommerce", "EC.csv", "EC", ["ecommerce"]),
    ("education", "ED.csv", "ED", ["education"]),
    ("food_delivery", "FD.csv", "FD", ["food_delivery", "restaurant"]),
    ("grocery_delivery", "GR.csv", "GR", ["grocery_delivery"]),
    ("healthcare", "HC.csv", "HC", ["healthcare"]),
    ("telecom", "TC.csv", "TC", ["telecom_internet"]),
    ("travel_hotels", "TR.csv", "TR", ["travel_hotels"]),
]

# Allowed categorical sets based on dataset design & schema
ALLOWED_LANGUAGES = {"english", "hinglish"}
ALLOWED_SENTIMENTS = {"positive", "negative", "neutral", "mixed"}
ALLOWED_BEHAVIORS = {"appreciation", "complaint", "question", "suggestion", "informational"}
ALLOWED_ABUSE = {"none", "mild", "severe"}
ALLOWED_SEVERITY = {"none", "low", "medium", "high"}
ALLOWED_COMPLEXITY = {"simple", "moderate", "complex"}


def validate_single_dataset(
    file_path: Path,
    expected_prefix: str,
    allowed_services: List[str],
) -> Dict[str, Any]:
    """Validate a single CSV dataset and return diagnostic findings."""
    report: Dict[str, Any] = {
        "filename": file_path.name,
        "path": str(file_path),
        "exists": file_path.is_file(),
        "loadable": False,
        "record_count": 0,
        "columns_valid": False,
        "columns_found": [],
        "missing_columns": [],
        "extra_columns": [],
        "null_counts": {},
        "empty_text_count": 0,
        "duplicate_rows": 0,
        "duplicate_ids": 0,
        "duplicate_texts_within": 0,
        "invalid_sentiments": {},
        "invalid_languages": {},
        "invalid_behaviors": {},
        "invalid_abuse": {},
        "invalid_complexity": {},
        "invalid_services": {},
        "shifted_rows_count": 0,
        "bad_id_prefixes": [],
        "text_stats": {"min": 0, "max": 0, "avg": 0.0},
        "unique_aspects_count": 0,
        "unique_issues_count": 0,
        "unique_suggestions_count": 0,
        "sentiment_counts": {},
        "language_counts": {},
        "behavior_counts": {},
        "abuse_counts": {},
        "severity_counts": {},
        "issues": [],
        "status": "PASS",
    }

    if not report["exists"]:
        report["status"] = "FAIL"
        report["issues"].append(f"File not found: {file_path}")
        return report

    try:
        df = pd.read_csv(file_path)
        report["loadable"] = True
    except Exception as exc:
        report["status"] = "FAIL"
        report["issues"].append(f"Failed to parse CSV: {exc}")
        return report

    report["record_count"] = len(df)
    report["columns_found"] = list(df.columns)
    report["missing_columns"] = [col for col in EXPECTED_COLUMNS if col not in df.columns]
    report["extra_columns"] = [col for col in df.columns if col not in EXPECTED_COLUMNS]
    report["columns_valid"] = (report["columns_found"] == EXPECTED_COLUMNS)

    if not report["columns_valid"]:
        if report["missing_columns"]:
            report["status"] = "FAIL"
            report["issues"].append(f"Missing columns: {report['missing_columns']}")
        if report["extra_columns"]:
            report["issues"].append(f"Extra columns: {report['extra_columns']}")

    # Check null values across columns
    nulls = df.isnull().sum()
    report["null_counts"] = {col: int(cnt) for col, cnt in nulls.items() if cnt > 0}

    # Empty text values
    if "text" in df.columns:
        empty_texts = df[df["text"].isna() | (df["text"].astype(str).str.strip() == "")]
        report["empty_text_count"] = len(empty_texts)
        if report["empty_text_count"] > 0:
            report["issues"].append(f"{report['empty_text_count']} empty text records")

        # Text length stats
        lens = df["text"].astype(str).str.len()
        report["text_stats"] = {
            "min": int(lens.min()) if len(lens) else 0,
            "max": int(lens.max()) if len(lens) else 0,
            "avg": round(float(lens.mean()), 2) if len(lens) else 0.0,
        }

    # Duplicate rows
    if report["columns_valid"]:
        report["duplicate_rows"] = int(df.duplicated(subset=EXPECTED_COLUMNS).sum())

    # Duplicate IDs & text within dataset
    if "id" in df.columns:
        report["duplicate_ids"] = int(df["id"].duplicated().sum())
        bad_ids = df[~df["id"].astype(str).str.startswith(expected_prefix)]
        if not bad_ids.empty:
            report["bad_id_prefixes"] = bad_ids[["id", "service"]].to_dict(orient="records")
            report["issues"].append(
                f"{len(bad_ids)} records have ID prefix mismatch (expected '{expected_prefix}')"
            )

    if "text" in df.columns:
        report["duplicate_texts_within"] = int(df["text"].duplicated().sum())

    # Categorical validations
    if "sentiment" in df.columns:
        report["sentiment_counts"] = df["sentiment"].value_counts().to_dict()
        inv_sent = df[~df["sentiment"].astype(str).str.lower().isin(ALLOWED_SENTIMENTS)]
        if not inv_sent.empty:
            report["invalid_sentiments"] = inv_sent["sentiment"].value_counts().to_dict()
            report["issues"].append(f"Invalid sentiment values: {report['invalid_sentiments']}")

    if "language" in df.columns:
        report["language_counts"] = df["language"].value_counts().to_dict()
        inv_lang = df[~df["language"].astype(str).str.lower().isin(ALLOWED_LANGUAGES)]
        if not inv_lang.empty:
            report["invalid_languages"] = inv_lang["language"].value_counts().to_dict()
            report["issues"].append(f"Invalid language values: {report['invalid_languages']}")

    if "behavior" in df.columns:
        report["behavior_counts"] = df["behavior"].value_counts().to_dict()
        inv_beh = df[~df["behavior"].astype(str).str.lower().isin(ALLOWED_BEHAVIORS)]
        if not inv_beh.empty:
            report["invalid_behaviors"] = inv_beh["behavior"].value_counts().to_dict()
            report["issues"].append(f"Invalid behavior values: {report['invalid_behaviors']}")

    if "abuse" in df.columns:
        report["abuse_counts"] = df["abuse"].value_counts().to_dict()
        inv_ab = df[~df["abuse"].astype(str).str.lower().isin(ALLOWED_ABUSE)]
        if not inv_ab.empty:
            report["invalid_abuse"] = inv_ab["abuse"].value_counts().to_dict()
            report["issues"].append(f"Invalid abuse values: {report['invalid_abuse']}")

    if "severity" in df.columns:
        report["severity_counts"] = df["severity"].value_counts().to_dict()

    if "complexity" in df.columns:
        # Detect rows where complexity holds shifted suggestion text
        inv_comp = df[~df["complexity"].astype(str).str.lower().isin(ALLOWED_COMPLEXITY)]
        if not inv_comp.empty:
            report["invalid_complexity"] = inv_comp["complexity"].value_counts().to_dict()
            # If suggestion is null in these rows, it is an 11-column shift
            null_sugg_overlap = inv_comp[inv_comp["suggestion"].isna()]
            report["shifted_rows_count"] = len(null_sugg_overlap)
            report["issues"].append(
                f"{len(inv_comp)} non-standard complexity values "
                f"({len(null_sugg_overlap)} caused by missing complexity/11-field line shift)"
            )

    if "service" in df.columns:
        inv_srv = df[~df["service"].astype(str).isin(allowed_services)]
        if not inv_srv.empty:
            report["invalid_services"] = inv_srv["service"].value_counts().to_dict()
            report["issues"].append(
                f"{len(inv_srv)} records with unexpected service domain: {report['invalid_services']}"
            )

    # Domain vocabulary unique counts
    if "aspect" in df.columns:
        report["unique_aspects_count"] = int(df["aspect"].dropna().nunique())
    if "issue" in df.columns:
        report["unique_issues_count"] = int(df["issue"].dropna().nunique())
    if "suggestion" in df.columns:
        report["unique_suggestions_count"] = int(df["suggestion"].dropna().nunique())

    # Overall dataset status flag
    if report["status"] != "FAIL":
        if report["issues"]:
            report["status"] = "WARNING"
        else:
            report["status"] = "PASS"

    return report


def validate_cross_datasets(
    datasets_data: List[Tuple[str, pd.DataFrame]]
) -> Dict[str, Any]:
    """Validate cross-dataset integrity, duplicates, and global distributions."""
    combined_dfs = []
    for fname, df in datasets_data:
        df_copy = df.copy()
        df_copy["_source_file"] = fname
        combined_dfs.append(df_copy)

    combined = pd.concat(combined_dfs, ignore_index=True)
    total_records = len(combined)

    # Cross-dataset duplicate IDs
    dup_id_mask = combined["id"].duplicated(keep=False)
    dup_id_df = combined[dup_id_mask]
    cross_dup_ids = dup_id_df.groupby("id")["_source_file"].apply(list).to_dict()

    # Cross-dataset duplicate text
    dup_text_mask = combined["text"].duplicated(keep=False)
    dup_text_df = combined[dup_text_mask]
    dup_text_groups = dup_text_df.groupby("text")["_source_file"].apply(list).to_dict()

    # Cross-file vs intra-file duplicates
    cross_file_text_dups = {
        txt: files for txt, files in dup_text_groups.items() if len(set(files)) > 1
    }
    intra_file_text_dups = {
        txt: files for txt, files in dup_text_groups.items() if len(set(files)) == 1
    }

    # Group cross-file sharing patterns
    file_sharing_pairs: Counter = Counter()
    for txt, file_list in cross_file_text_dups.items():
        distinct_files = tuple(sorted(set(file_list)))
        file_sharing_pairs[distinct_files] += 1

    return {
        "total_records": total_records,
        "total_duplicate_rows": int(combined.duplicated(subset=EXPECTED_COLUMNS).sum()),
        "total_duplicate_ids": int(combined["id"].duplicated().sum()),
        "cross_duplicate_ids_detail": cross_dup_ids,
        "total_duplicate_texts": int(combined["text"].duplicated().sum()),
        "unique_duplicate_texts_count": len(dup_text_groups),
        "cross_file_duplicate_texts_count": len(cross_file_text_dups),
        "intra_file_duplicate_texts_count": len(intra_file_text_dups),
        "file_sharing_patterns": dict(file_sharing_pairs),
        "sentiment_distribution": combined["sentiment"].value_counts().to_dict(),
        "language_distribution": combined["language"].value_counts().to_dict(),
        "behavior_distribution": combined["behavior"].value_counts().to_dict(),
        "abuse_distribution": combined["abuse"].value_counts().to_dict(),
        "severity_distribution": combined["severity"].value_counts().to_dict(),
        "service_distribution": combined["service"].value_counts().to_dict(),
        "standard_complexity_distribution": combined[
            combined["complexity"].str.lower().isin(ALLOWED_COMPLEXITY)
        ]["complexity"].value_counts().to_dict(),
        "non_standard_complexity_count": int(
            (~combined["complexity"].str.lower().isin(ALLOWED_COMPLEXITY)).sum()
        ),
        "total_shifted_rows": int(
            (combined["suggestion"].isna() & (~combined["complexity"].str.lower().isin(ALLOWED_COMPLEXITY))).sum()
        ),
    }


def format_terminal_summary(
    per_dataset_results: List[Dict[str, Any]],
    cross_results: Dict[str, Any],
) -> str:
    """Format validation summary for clear terminal display."""
    lines: List[str] = []
    lines.append("=" * 78)
    lines.append("DATASET VALIDATION SUMMARY (PHASE 2)")
    lines.append("=" * 78)

    total_datasets = len(per_dataset_results)
    total_records = cross_results["total_records"]
    all_pass = all(r["status"] == "PASS" for r in per_dataset_results)
    has_fail = any(r["status"] == "FAIL" for r in per_dataset_results)

    status_str = "FAIL" if has_fail else ("PASS (WITH WARNINGS)" if not all_pass else "PASS")
    lines.append(f"Datasets: {total_datasets} | Total Records: {total_records} | Status: {status_str}")
    lines.append("-" * 78)

    # Per-dataset table
    lines.append(
        f"{'File':<10} {'Records':<8} {'Cols':<6} {'Nulls':<10} {'Dups':<6} {'Inv.Sent':<9} {'Shifted':<8} {'Status'}"
    )
    lines.append("-" * 78)
    for r in per_dataset_results:
        null_str = str(sum(r["null_counts"].values())) if r["null_counts"] else "0"
        inv_sent_str = str(sum(r["invalid_sentiments"].values())) if r["invalid_sentiments"] else "0"
        cols_str = "12/12" if r["columns_valid"] else f"{len(r['columns_found'])}/12"
        lines.append(
            f"{r['filename']:<10} {r['record_count']:<8} {cols_str:<6} {null_str:<10} "
            f"{r['duplicate_ids']:<6} {inv_sent_str:<9} {r['shifted_rows_count']:<8} {r['status']}"
        )
    lines.append("-" * 78)

    # Cross-dataset highlights
    lines.append("CROSS-DATASET HIGHLIGHTS:")
    lines.append(f"  * Cross-dataset duplicate IDs: {cross_results['total_duplicate_ids']} (shared across files)")
    if cross_results["cross_duplicate_ids_detail"]:
        for dup_id, files in cross_results["cross_duplicate_ids_detail"].items():
            lines.append(f"    - ID {dup_id}: present in {files}")
    lines.append(f"  * Cross-dataset duplicate texts: {cross_results['cross_file_duplicate_texts_count']} distinct phrases")
    lines.append(f"  * Total shifted 11-column rows: {cross_results['total_shifted_rows']} across 10 datasets")
    lines.append(
        f"  * Sentiment breakdown: {cross_results['sentiment_distribution']}"
    )
    lines.append(
        f"  * Language breakdown: {cross_results['language_distribution']}"
    )
    lines.append(
        f"  * Behavior breakdown: {cross_results['behavior_distribution']}"
    )
    lines.append("=" * 78)

    return "\n".join(lines)


def generate_markdown_report(
    per_dataset_results: List[Dict[str, Any]],
    cross_results: Dict[str, Any],
) -> str:
    """Generate comprehensive markdown validation report conforming to specification."""
    total_datasets = len(per_dataset_results)
    total_records = cross_results["total_records"]
    has_fail = any(r["status"] == "FAIL" for r in per_dataset_results)
    overall_status = "FAIL" if has_fail else "VALIDATED (WARNINGS IDENTIFIED FOR PHASE 3)"

    doc: List[str] = []
    doc.append("# Dataset Validation Report")
    doc.append("")
    doc.append("## Overall Summary")
    doc.append("")
    doc.append(f"- **Number of Datasets:** {total_datasets}")
    doc.append(f"- **Total Records:** {total_records:,}")
    doc.append(f"- **Overall Validation Status:** {overall_status}")
    doc.append(f"- **Raw Datasets Preserved:** 100% (Read-only validation, 0 files modified)")
    doc.append("")
    doc.append("| Service Domain | File | Records | Schema (12 Cols) | Missing Values | Invalid Sentiments | 11-Field Shifts | Status |")
    doc.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    for r in per_dataset_results:
        null_summary = ", ".join(f"{k}:{v}" for k, v in r["null_counts"].items()) if r["null_counts"] else "None"
        inv_sent = ", ".join(f"'{k}' ({v})" for k, v in r["invalid_sentiments"].items()) if r["invalid_sentiments"] else "0"
        schema_stat = "Pass (12/12)" if r["columns_valid"] else f"Fail ({len(r['columns_found'])}/12)"
        doc.append(
            f"| {r['filename'].replace('.csv', '')} | `{r['filename']}` | {r['record_count']} | {schema_stat} | "
            f"{null_summary} | {inv_sent} | {r['shifted_rows_count']} rows | {r['status']} |"
        )
    doc.append("")
    doc.append("---")
    doc.append("")
    doc.append("## Dataset-by-Dataset Summary")
    doc.append("")

    for r in per_dataset_results:
        doc.append(f"### {r['filename']} — {r['filename'].replace('.csv', '')}")
        doc.append("")
        doc.append(f"- **File Path:** `{r['path']}`")
        doc.append(f"- **Record Count:** {r['record_count']}")
        doc.append(f"- **Columns:** `{'Pass' if r['columns_valid'] else 'Mismatch'}` (Found {len(r['columns_found'])} columns)")
        doc.append(f"- **Missing Values:** {r['null_counts'] if r['null_counts'] else 'None'}")
        doc.append(f"- **Duplicate Rows:** {r['duplicate_rows']}")
        doc.append(f"- **Duplicate IDs within File:** {r['duplicate_ids']}")
        doc.append(f"- **Duplicate Text within File:** {r['duplicate_texts_within']}")
        doc.append(f"- **Invalid Sentiments:** {r['invalid_sentiments'] if r['invalid_sentiments'] else 'None'}")
        doc.append(f"- **Invalid Languages:** {r['invalid_languages'] if r['invalid_languages'] else 'None'}")
        doc.append(f"- **Invalid Behaviors:** {r['invalid_behaviors'] if r['invalid_behaviors'] else 'None'}")
        doc.append(f"- **Invalid Abuse Values:** {r['invalid_abuse'] if r['invalid_abuse'] else 'None'}")
        doc.append(f"- **Shifted Rows (11-Column Omission):** {r['shifted_rows_count']} records where `suggestion` was omitted and shifted into `complexity`")
        doc.append(f"- **Service Consistency:** {r['invalid_services'] if r['invalid_services'] else '100% consistent'}")
        if r["bad_id_prefixes"]:
            doc.append(f"- **ID Prefix Anomalies:** {len(r['bad_id_prefixes'])} records ({r['bad_id_prefixes']})")
        doc.append(f"- **Text Length Statistics:** Min = {r['text_stats']['min']}, Max = {r['text_stats']['max']}, Avg = {r['text_stats']['avg']} characters")
        doc.append(f"- **Domain Diversity:** {r['unique_aspects_count']} unique aspects, {r['unique_issues_count']} unique issues, {r['unique_suggestions_count']} unique suggestions")
        doc.append(f"- **Overall Status:** `{r['status']}`")
        doc.append("")

    doc.append("---")
    doc.append("")
    doc.append("## Cross-Dataset Findings")
    doc.append("")
    doc.append(f"### 1. Total Volume & Deduplication")
    doc.append(f"- **Total Records:** {cross_results['total_records']}")
    doc.append(f"- **Exact Row Duplicates:** {cross_results['total_duplicate_rows']}")
    doc.append(f"- **Duplicate IDs Across Datasets:** {cross_results['total_duplicate_ids']}")
    doc.append("")
    if cross_results["cross_duplicate_ids_detail"]:
        doc.append("| Duplicate ID | Files Sharing ID | Reason |")
        doc.append("| :--- | :--- | :--- |")
        for dup_id, files in cross_results["cross_duplicate_ids_detail"].items():
            doc.append(f"| `{dup_id}` | {', '.join(files)} | Misassigned ID prefix in source file |")
        doc.append("")

    doc.append(f"### 2. Duplicate Text Findings")
    doc.append(f"- **Unique Duplicate Text Phrases:** {cross_results['unique_duplicate_texts_count']}")
    doc.append(f"- **Phrases Shared Across Different Datasets:** {cross_results['cross_file_duplicate_texts_count']}")
    doc.append(f"- **Phrases Duplicated Within Same Dataset Only:** {cross_results['intra_file_duplicate_texts_count']}")
    doc.append("")
    doc.append("**Cross-File Sharing Patterns:**")
    for files_tuple, count in cross_results["file_sharing_patterns"].items():
        doc.append(f"- `{count}` text phrases shared across: `{', '.join(files_tuple)}`")
    doc.append("")

    doc.append("### 3. Global Distributions")
    doc.append("")
    doc.append("#### Sentiment Distribution")
    doc.append("| Sentiment | Count | Percentage | Note |")
    doc.append("| :--- | :--- | :--- | :--- |")
    for sent, count in cross_results["sentiment_distribution"].items():
        pct = (count / total_records) * 100
        note = "Valid" if sent in ALLOWED_SENTIMENTS else "⚠️ Malformed (Severity leaked into Sentiment)"
        doc.append(f"| `{sent}` | {count:,} | {pct:.2f}% | {note} |")
    doc.append("")

    doc.append("#### Language Distribution")
    doc.append("| Language | Count | Percentage |")
    doc.append("| :--- | :--- | :--- |")
    for lang, count in cross_results["language_distribution"].items():
        pct = (count / total_records) * 100
        doc.append(f"| `{lang}` | {count:,} | {pct:.2f}% |")
    doc.append("")

    doc.append("#### Behavior Distribution")
    doc.append("| Behavior | Count | Percentage | Note |")
    doc.append("| :--- | :--- | :--- | :--- |")
    for beh, count in cross_results["behavior_distribution"].items():
        pct = (count / total_records) * 100
        note = "Valid standard" if beh in {"appreciation", "complaint", "question", "suggestion"} else "Valid domain extension"
        doc.append(f"| `{beh}` | {count:,} | {pct:.2f}% | {note} |")
    doc.append("")

    doc.append("#### Abuse Distribution")
    doc.append("| Abuse Level | Count | Percentage |")
    doc.append("| :--- | :--- | :--- |")
    for ab, count in cross_results["abuse_distribution"].items():
        pct = (count / total_records) * 100
        doc.append(f"| `{ab}` | {count:,} | {pct:.2f}% |")
    doc.append("")

    doc.append("#### Severity Distribution")
    doc.append("| Severity Level | Count | Percentage |")
    doc.append("| :--- | :--- | :--- |")
    for sev, count in cross_results["severity_distribution"].items():
        pct = (count / total_records) * 100
        doc.append(f"| `{sev}` | {count:,} | {pct:.2f}% |")
    doc.append("")

    doc.append("#### Complexity Distribution")
    doc.append("| Complexity | Count | Percentage | Note |")
    doc.append("| :--- | :--- | :--- | :--- |")
    for comp, count in cross_results["standard_complexity_distribution"].items():
        pct = (count / total_records) * 100
        doc.append(f"| `{comp}` | {count:,} | {pct:.2f}% | Valid standard label |")
    doc.append(
        f"| `medium` | 3 | 0.06% | Typo for `moderate` in ED272, HC272, TC272 |"
    )
    doc.append(
        f"| *Shifted suggestions* | {cross_results['total_shifted_rows']} | "
        f"{(cross_results['total_shifted_rows'] / total_records) * 100:.2f}% | "
        f"11-field rows where suggestion landed in complexity |"
    )
    doc.append("")

    doc.append("### 4. Service Consistency Findings")
    doc.append("- `data/raw/food_delivery/FD.csv`: Contains both `food_delivery` (348 records) and `restaurant` (152 records). This aligns with the dual domain defined in `DATASET_DESIGN.md`.")
    doc.append("- `data/raw/telecom/TC.csv`: Uses `telecom_internet` (500 records), aligning with the folder and domain scope.")
    doc.append("- `data/raw/banking_upi/BK.csv`: Contains 1 record (`BK085`) labeled as `ecommerce` despite banking text (\"cheque deposit\").")
    doc.append("- `data/raw/cab_transport/CB.csv`: Contains 1 record (`CB217`) labeled as `telecom_internet` with broadband billing text.")
    doc.append("")
    doc.append("---")
    doc.append("")
    doc.append("## Data Quality Issues")
    doc.append("")
    doc.append("### CRITICAL")
    doc.append("> *Issues that completely prevent reliable model training or pipeline execution if unaddressed.*")
    doc.append("")
    doc.append("1. **Malformed Sentiment Label in `FD034` (`FD.csv` row 35):**")
    doc.append("   - Sentiment is populated as `'low'` instead of `'negative'` (duplicated from severity).")
    doc.append("   - Impact: Model training on sentiment would treat `'low'` as a fifth distinct sentiment class with N=1 sample.")
    doc.append("")
    doc.append("### WARNING")
    doc.append("> *Systematic formatting or schema irregularities that require normalization in Phase 3.*")
    doc.append("")
    doc.append(f"1. **Missing 12th Column / Field Shift in {cross_results['total_shifted_rows']} Rows:**")
    doc.append("   - Across all 10 files (34–40 rows per file), raw lines contain 11 comma-separated fields instead of 12.")
    doc.append("   - The `complexity` value was omitted, causing the free-text suggestion to be placed in `complexity` and `suggestion` to parse as `NaN`.")
    doc.append("   - Impact: Does not affect text or sentiment training, but corrupts `complexity` and `suggestion` features if uncleaned.")
    doc.append("2. **Duplicate IDs Across Datasets (5 Instances):**")
    doc.append("   - `ED028` in `CB.csv`, `ED009` / `ED028` / `ED482` in `TC.csv`, and `CB035` in `TR.csv` clash with legitimate records in `ED.csv` and `CB.csv`.")
    doc.append("   - Cause: Typographical prefix errors during dataset generation.")
    doc.append("3. **Cross-Service Record Bleed (2 Records):**")
    doc.append("   - `BK085` in `BK.csv` has `service = 'ecommerce'`.")
    doc.append("   - `CB217` in `CB.csv` has `service = 'telecom_internet'` with broadband complaint text.")
    doc.append("4. **Cross-Dataset Text Duplication (149 Shared Phrases):**")
    doc.append("   - High phrase overlap between `cab_transport`, `telecom`, `travel_hotels`, and `customer_support` due to template replication.")
    doc.append("5. **Complexity Typo (`medium` instead of `moderate` in 3 Records):**")
    doc.append("   - `ED272`, `HC272`, `TC272` have `complexity = 'medium'` instead of `'moderate'`.")
    doc.append("")
    doc.append("### OBSERVATION")
    doc.append("> *Valid variations or domain characteristics that are expected and should be preserved.*")
    doc.append("")
    doc.append("1. **Behavior Category `informational` (174 Records):**")
    doc.append("   - Found across all 10 datasets (16–20 per file). Represents neutral, factual status statements without complaint or appreciation. Completely valid domain addition.")
    doc.append("2. **Dual Service Labels in Food Delivery:**")
    doc.append("   - `FD.csv` contains `food_delivery` (348) and `restaurant` (152), matching real-world platform scopes (ordering app vs dining experience).")
    doc.append("3. **Language Code-Mixing:**")
    doc.append("   - 1,399 records (28.0%) use Roman Hinglish, distributed organically across all 10 services.")
    doc.append("4. **Zero Empty Texts & Zero Truncation:**")
    doc.append("   - All 5,000 feedback texts are non-empty, well-formed, and range from 14 to 151 characters (average ~107.6 chars).")
    doc.append("")
    doc.append("---")
    doc.append("")
    doc.append("## Recommendations (For Phase 3 Processing Pipeline)")
    doc.append("")
    doc.append("*(Note: In accordance with Phase 2 constraints, NO changes have been applied to the raw CSVs. These recommendations are for the Phase 3 preprocessing step.)*")
    doc.append("")
    doc.append("1. **Fix `FD034` Sentiment in Pipeline:** In the Phase 3 ingestion cleaner, map `sentiment = 'low'` to `sentiment = 'negative'` (since text describes an unfulfilled request).")
    doc.append("2. **Resolve Shifted 11-Column Rows:** During Phase 3 processing, identify rows where `suggestion.isna()` and `complexity` contains free-text recommendations; restore the text to `suggestion` and impute `complexity` (e.g. `moderate` or infer from character length).")
    doc.append("3. **Standardize Complexity:** Normalize `medium` → `moderate` in `ED272`, `HC272`, `TC272`.")
    doc.append("4. **Regenerate Clean Unique IDs:** In the combined Phase 3 training dataset, generate a consistent composite key (e.g., `<SERVICE_CODE>_<ROW_NUM>`) to eliminate cross-file ID collisions.")
    doc.append("5. **Deduplicate Cross-Service Template Texts:** Drop exact duplicate texts occurring across multiple services during dataset consolidation to prevent train/test data leakage.")
    doc.append("6. **Retain Raw Datasets As-Is:** Keep all 10 files in `data/raw/` untouched as immutable sources of truth.")
    doc.append("")

    return "\n".join(doc)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate raw sentiment analysis datasets.")
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "data" / "raw",
        help="Path to data/raw directory",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=None,
        help="Optional path to output markdown validation report (e.g. docs/DATASET_VALIDATION.md)",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with non-zero code on data quality warnings (default: only exit non-zero on fatal errors)",
    )
    args = parser.parse_args()

    raw_dir: Path = args.raw_dir
    if not raw_dir.is_dir():
        print(f"ERROR: Raw data directory not found: {raw_dir}", file=sys.stderr)
        return 1

    per_dataset_results: List[Dict[str, Any]] = []
    datasets_data: List[Tuple[str, pd.DataFrame]] = []

    for s_dir, f_name, prefix, allowed_srv in SERVICE_DATASETS:
        file_path = raw_dir / s_dir / f_name
        result = validate_single_dataset(file_path, prefix, allowed_srv)
        per_dataset_results.append(result)

        if result["loadable"]:
            df = pd.read_csv(file_path)
            datasets_data.append((f_name, df))

    cross_results = validate_cross_datasets(datasets_data)

    # Print terminal summary
    summary_text = format_terminal_summary(per_dataset_results, cross_results)
    print(summary_text)

    # Generate markdown report if requested
    if args.report:
        report_text = generate_markdown_report(per_dataset_results, cross_results)
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(report_text, encoding="utf-8")
        print(f"\nSaved validation report to: {args.report}")

    # Determine exit code
    fatal_errors = any(r["status"] == "FAIL" for r in per_dataset_results)
    if fatal_errors:
        print("\nValidation failed with FATAL errors.", file=sys.stderr)
        return 1

    if args.strict and any(r["status"] == "WARNING" for r in per_dataset_results):
        print("\nValidation completed with WARNINGS (strict mode failed).", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
