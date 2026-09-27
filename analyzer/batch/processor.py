import io
import re
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from django.core.files.uploadedfile import UploadedFile

from analyzer.language_detection import DEVANAGARI_REGEX, devanagari_to_hinglish
from analyzer.analytics.categorizer import detect_category, get_category_label

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit
MAX_ROW_COUNT = 2000                   # 2,000 rows per batch
MAX_TEXT_CHAR_LENGTH = 1000            # Truncation cap for TF-IDF vectorization

PREFERRED_COLUMN_NAMES = [
    "review_text", "review", "text", "feedback", "comment",
    "comments", "reviews", "message", "content", "description", "body"
]


class BatchProcessingError(Exception):
    """Custom exception raised for expected batch validation failures."""
    pass


def parse_uploaded_file(uploaded_file: UploadedFile) -> pd.DataFrame:
    """
    Parse uploaded file (CSV, TSV, or XLSX) entirely in-memory into a pandas DataFrame.
    Implements multi-encoding fallback and file size verification.
    """
    # 1. Verify file size
    if uploaded_file.size > MAX_FILE_SIZE_BYTES:
        raise BatchProcessingError(
            f"File size exceeds the 5 MB limit (uploaded size: {uploaded_file.size / (1024 * 1024):.1f} MB)."
        )

    if uploaded_file.size == 0:
        raise BatchProcessingError("The uploaded file is empty (0 bytes).")

    filename = uploaded_file.name.lower()
    file_bytes = uploaded_file.read()

    # 2. Parse by file extension
    if filename.endswith(".xlsx"):
        try:
            df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")
        except Exception as exc:
            raise BatchProcessingError(f"Unable to parse Excel file: {str(exc)}") from exc
    elif filename.endswith((".csv", ".tsv", ".txt")):
        delimiter = "\t" if filename.endswith(".tsv") else ","
        df = None
        # Multi-tier encoding fallback
        encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
        for enc in encodings:
            try:
                df = pd.read_csv(
                    io.BytesIO(file_bytes),
                    sep=delimiter,
                    encoding=enc,
                    on_bad_lines="skip",
                )
                break
            except Exception:
                continue

        if df is None:
            raise BatchProcessingError(
                "Unable to decode text file. Please ensure it is saved in UTF-8 or standard CSV format."
            )
    else:
        raise BatchProcessingError(
            "Unsupported file format. Please upload a .csv or .xlsx file."
        )

    # 3. Check row counts
    total_rows = len(df)
    if total_rows == 0:
        raise BatchProcessingError("The uploaded file contains headers but no data rows.")

    if total_rows > MAX_ROW_COUNT:
        raise BatchProcessingError(
            f"File contains {total_rows:,} rows, which exceeds the maximum batch limit of {MAX_ROW_COUNT:,} rows. "
            "Please split your file into smaller batches."
        )

    return df


def detect_review_column(df: pd.DataFrame) -> str:
    """
    Detect which column contains review/feedback text using smart heuristic priorities:
    1. Exact common keyword match (case-insensitive)
    2. Column containing keyword as substring
    3. String column with highest average character length (> 12 characters)
    """
    normalized_cols = {col: str(col).strip().lower() for col in df.columns}

    # Priority 1: Exact keyword match
    for pref in PREFERRED_COLUMN_NAMES:
        for original_col, norm_col in normalized_cols.items():
            if norm_col == pref:
                return original_col

    # Priority 2: Substring match
    for pref in PREFERRED_COLUMN_NAMES:
        for original_col, norm_col in normalized_cols.items():
            if pref in norm_col and not norm_col.endswith("_id"):
                return original_col

    # Priority 3: Fallback to longest string column
    candidate_col = None
    max_avg_len = 0.0

    for col in df.columns:
        # Check if column is predominantly string / object
        sample = df[col].dropna().astype(str)
        if len(sample) > 0:
            avg_len = sample.str.len().mean()
            if avg_len > max_avg_len and avg_len > 12.0:
                max_avg_len = avg_len
                candidate_col = col

    if candidate_col is not None:
        return candidate_col

    raise BatchProcessingError(
        "Could not automatically detect a review text column. "
        "Please ensure at least one column is named 'review', 'text', 'comment', or 'feedback'."
    )


def sanitize_csv_formula_injection(val: Any) -> Any:
    """
    Sanitize text to prevent CSV/Excel Formula Injection attacks.
    If a string begins with =, +, -, or @, prepend a single quote so spreadsheet
    viewers treat it strictly as raw text.
    """
    if isinstance(val, str) and len(val) > 0:
        if val[0] in ("=", "+", "-", "@", "\t", "\r"):
            return f"'{val}"
    return val


def process_batch_predictions(
    df: pd.DataFrame,
    text_column: str,
    model: Any,
    vectorizer: Any,
) -> Dict[str, Any]:
    """
    Execute high-throughput, vectorized inference across the entire dataset:
    - Preprocesses text (Devanagari transliteration, length capping).
    - Runs 1-pass vectorized transform and predict_proba.
    - Computes top class, confidence score, and close-prediction margin.
    - Generates aggregate summary statistics and preview rows.
    """
    total_rows = len(df)
    raw_series = df[text_column].fillna("").astype(str)

    valid_mask = raw_series.str.strip().str.len() > 0
    valid_indices = df.index[valid_mask].tolist()
    valid_texts = raw_series[valid_mask].tolist()

    processed_rows = len(valid_texts)
    skipped_rows = total_rows - processed_rows

    if processed_rows == 0:
        raise BatchProcessingError(
            f"The selected column '{text_column}' contains no readable text (all rows are blank)."
        )

    # 1. Vectorized text preprocessing
    cleaned_texts = []
    for t in valid_texts:
        # Devanagari transliteration if script is detected
        norm_t = devanagari_to_hinglish(t) if DEVANAGARI_REGEX.search(t) else t
        # Truncate ultra-long inputs to 1,000 chars to avoid memory bloat
        truncated = norm_t[:MAX_TEXT_CHAR_LENGTH].lower()
        cleaned_texts.append(truncated)

    # 2. Vectorized TF-IDF feature extraction & inference in a single C-level pass
    X_vec = vectorizer.transform(cleaned_texts)
    classes = list(model.classes_)
    probs_matrix = model.predict_proba(X_vec)  # Shape: (N, 4)

    # Sort probabilities per row
    # top_indices = highest probability, second_indices = runner-up
    sorted_prob_indices = np.argsort(probs_matrix, axis=1)
    top_indices = sorted_prob_indices[:, -1]
    second_indices = sorted_prob_indices[:, -2]

    top_probs = np.take_along_axis(probs_matrix, top_indices[:, None], axis=1).squeeze(1)
    second_probs = np.take_along_axis(probs_matrix, second_indices[:, None], axis=1).squeeze(1)

    margins = top_probs - second_probs
    is_close_flags = margins < 0.10

    predicted_classes = [classes[idx] for idx in top_indices]

    # 3. Detect date column if present in spreadsheet
    date_col = None
    for c in df.columns:
        c_norm = str(c).strip().lower()
        if c_norm in ("date", "review_date", "created_at", "timestamp", "time", "review_time"):
            date_col = c
            break

    # 4. Assemble results list, categories, & annotations
    results: List[Dict[str, Any]] = []
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
    category_counts: Dict[str, Dict[str, int]] = {}
    daily_breakdown: Dict[str, Dict[str, int]] = {}
    close_count = 0
    total_confidence = 0.0

    valid_ptr = 0
    for idx in range(total_rows):
        if idx in valid_indices:
            cls = predicted_classes[valid_ptr]
            score = round(float(top_probs[valid_ptr]), 4)
            is_close = bool(is_close_flags[valid_ptr])
            row_text = raw_series.iloc[idx]
            cat = detect_category(row_text)
            cat_label = get_category_label(cat)

            sentiment_counts[cls] = sentiment_counts.get(cls, 0) + 1
            if is_close:
                close_count += 1
            total_confidence += score

            # Accumulate category counts
            if cat not in category_counts:
                category_counts[cat] = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
            category_counts[cat][cls] = category_counts[cat].get(cls, 0) + 1

            # Accumulate daily breakdown if date column exists
            if date_col is not None:
                raw_d = str(df.iloc[idx][date_col]).strip()
                match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", raw_d)
                d_key = match.group(1) if match else raw_d[:10]
                if d_key and d_key != "nan":
                    if d_key not in daily_breakdown:
                        daily_breakdown[d_key] = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
                    daily_breakdown[d_key][cls] = daily_breakdown[d_key].get(cls, 0) + 1

            results.append({
                "row_number": idx + 1,
                "text": row_text[:180],
                "sentiment": cls,
                "confidence": round(score * 100, 1),
                "is_close": is_close,
                "category": cat,
                "category_label": cat_label,
                "status": "analyzed",
            })
            valid_ptr += 1
        else:
            results.append({
                "row_number": idx + 1,
                "text": "",
                "sentiment": "N/A",
                "confidence": 0.0,
                "is_close": False,
                "category": "general",
                "category_label": "General Service",
                "status": "skipped_empty",
            })

    # 4. Calculate aggregate metrics
    avg_confidence = round((total_confidence / processed_rows) * 100, 1) if processed_rows > 0 else 0.0

    percentages = {}
    for k, count in sentiment_counts.items():
        percentages[k] = round((count / processed_rows) * 100, 1) if processed_rows > 0 else 0.0

    summary = {
        "total_rows": total_rows,
        "processed_rows": processed_rows,
        "skipped_rows": skipped_rows,
        "detected_column": text_column,
        "sentiment_counts": sentiment_counts,
        "sentiment_percentages": percentages,
        "average_confidence": avg_confidence,
        "close_predictions_count": close_count,
        "category_counts": category_counts,
        "daily_breakdown": daily_breakdown,
    }

    # 5. Build enriched annotated DataFrame for CSV export
    annotated_df = df.copy()

    # Build parallel column arrays
    pred_col = []
    conf_col = []
    close_col = []
    cat_col = []

    valid_ptr = 0
    for idx in range(total_rows):
        if idx in valid_indices:
            pred_col.append(predicted_classes[valid_ptr])
            conf_col.append(round(float(top_probs[valid_ptr]) * 100, 1))
            close_col.append("Yes" if is_close_flags[valid_ptr] else "No")
            cat_col.append(get_category_label(detect_category(raw_series.iloc[idx])))
            valid_ptr += 1
        else:
            pred_col.append("N/A")
            conf_col.append(0.0)
            close_col.append("No")
            cat_col.append("N/A")

    annotated_df["predicted_sentiment"] = pred_col
    annotated_df["confidence_score"] = conf_col
    annotated_df["is_close_prediction"] = close_col
    annotated_df["predicted_category"] = cat_col

    # Apply CSV formula injection protection to all object/string cells
    for col in annotated_df.select_dtypes(include=["object"]).columns:
        annotated_df[col] = annotated_df[col].apply(sanitize_csv_formula_injection)

    # Generate CSV string in memory
    csv_buffer = io.StringIO()
    annotated_df.to_csv(csv_buffer, index=False)
    csv_content = csv_buffer.getvalue()

    return {
        "summary": summary,
        "preview_results": results[:25],  # First 25 rows for instant UI preview
        "annotated_csv": csv_content,
    }
