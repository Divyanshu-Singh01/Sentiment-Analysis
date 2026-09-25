# Dataset Validation Report (Phase 2)

> **Context:** This report records the initial structural validation of the raw service datasets conducted in **Phase 2** (when each dataset contained 500 records, totaling 5,000 records). Deficiencies discovered here were resolved in the Phase 3 cleaning pipeline (`clean_datasets.py`), and the datasets were later expanded to 8,000 records in Phase 6.4.

## Overall Summary

- **Number of Datasets:** 10
- **Total Records (Phase 2 baseline):** 5,000
- **Overall Validation Status:** VALIDATED (WARNINGS IDENTIFIED FOR PHASE 3)
- **Raw Datasets Preserved:** 100% (Read-only validation, 0 files modified)

| Service Domain | File | Records | Schema (12 Cols) | Missing Values | Invalid Sentiments | 11-Field Shifts | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BK | `BK.csv` | 500 | Pass (12/12) | suggestion:36 | 0 | 36 rows | WARNING |
| CB | `CB.csv` | 500 | Pass (12/12) | suggestion:38 | 0 | 38 rows | WARNING |
| CS | `CS.csv` | 500 | Pass (12/12) | suggestion:37 | 0 | 37 rows | WARNING |
| EC | `EC.csv` | 500 | Pass (12/12) | suggestion:36 | 0 | 36 rows | WARNING |
| ED | `ED.csv` | 500 | Pass (12/12) | suggestion:38 | 0 | 38 rows | WARNING |
| FD | `FD.csv` | 500 | Pass (12/12) | suggestion:34 | 'low' (1) | 34 rows | WARNING |
| GR | `GR.csv` | 500 | Pass (12/12) | suggestion:35 | 0 | 35 rows | WARNING |
| HC | `HC.csv` | 500 | Pass (12/12) | suggestion:40 | 0 | 40 rows | WARNING |
| TC | `TC.csv` | 500 | Pass (12/12) | suggestion:38 | 0 | 38 rows | WARNING |
| TR | `TR.csv` | 500 | Pass (12/12) | suggestion:37 | 0 | 37 rows | WARNING |

---

## Dataset-by-Dataset Summary

### BK.csv — BK

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\banking_upi\BK.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 36}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 0
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 36 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** {'ecommerce': 1}
- **Text Length Statistics:** Min = 58, Max = 149, Avg = 110.43 characters
- **Domain Diversity:** 21 unique aspects, 26 unique issues, 233 unique suggestions
- **Overall Status:** `WARNING`

### CB.csv — CB

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\cab_transport\CB.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 38}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 13
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 38 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** {'telecom_internet': 1}
- **ID Prefix Anomalies:** 1 records ([{'id': 'ED028', 'service': 'cab_transport'}])
- **Text Length Statistics:** Min = 49, Max = 145, Avg = 114.72 characters
- **Domain Diversity:** 22 unique aspects, 26 unique issues, 241 unique suggestions
- **Overall Status:** `WARNING`

### CS.csv — CS

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\customer_support\CS.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 37}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 15
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 37 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 42, Max = 140, Avg = 109.28 characters
- **Domain Diversity:** 23 unique aspects, 24 unique issues, 241 unique suggestions
- **Overall Status:** `WARNING`

### EC.csv — EC

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\ecommerce\EC.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 36}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 0
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 36 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 39, Max = 127, Avg = 99.31 characters
- **Domain Diversity:** 25 unique aspects, 22 unique issues, 235 unique suggestions
- **Overall Status:** `WARNING`

### ED.csv — ED

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\education\ED.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 38}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 1
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 38 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 48, Max = 146, Avg = 118.73 characters
- **Domain Diversity:** 26 unique aspects, 24 unique issues, 245 unique suggestions
- **Overall Status:** `WARNING`

### FD.csv — FD

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\food_delivery\FD.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 34}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 0
- **Invalid Sentiments:** {'low': 1}
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 34 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 14, Max = 122, Avg = 76.26 characters
- **Domain Diversity:** 21 unique aspects, 16 unique issues, 221 unique suggestions
- **Overall Status:** `WARNING`

### GR.csv — GR

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\grocery_delivery\GR.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 35}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 0
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 35 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 46, Max = 134, Avg = 98.39 characters
- **Domain Diversity:** 21 unique aspects, 20 unique issues, 236 unique suggestions
- **Overall Status:** `WARNING`

### HC.csv — HC

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\healthcare\HC.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 40}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 0
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 40 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **Text Length Statistics:** Min = 45, Max = 151, Avg = 114.62 characters
- **Domain Diversity:** 23 unique aspects, 19 unique issues, 238 unique suggestions
- **Overall Status:** `WARNING`

### TC.csv — TC

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\telecom\TC.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 38}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 7
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 38 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **ID Prefix Anomalies:** 3 records ([{'id': 'ED009', 'service': 'telecom_internet'}, {'id': 'ED028', 'service': 'telecom_internet'}, {'id': 'ED482', 'service': 'telecom_internet'}])
- **Text Length Statistics:** Min = 49, Max = 149, Avg = 119.8 characters
- **Domain Diversity:** 24 unique aspects, 26 unique issues, 236 unique suggestions
- **Overall Status:** `WARNING`

### TR.csv — TR

- **File Path:** `C:\Users\hp\OneDrive\Desktop\Sentiment Analysis\data\raw\travel_hotels\TR.csv`
- **Record Count:** 500
- **Columns:** `Pass` (Found 12 columns)
- **Missing Values:** {'suggestion': 37}
- **Duplicate Rows:** 0
- **Duplicate IDs within File:** 0
- **Duplicate Text within File:** 2
- **Invalid Sentiments:** None
- **Invalid Languages:** None
- **Invalid Behaviors:** None
- **Invalid Abuse Values:** None
- **Shifted Rows (11-Column Omission):** 37 records where `suggestion` was omitted and shifted into `complexity`
- **Service Consistency:** 100% consistent
- **ID Prefix Anomalies:** 1 records ([{'id': 'CB035', 'service': 'travel_hotels'}])
- **Text Length Statistics:** Min = 52, Max = 143, Avg = 114.34 characters
- **Domain Diversity:** 28 unique aspects, 27 unique issues, 242 unique suggestions
- **Overall Status:** `WARNING`

---

## Cross-Dataset Findings

### 1. Total Volume & Deduplication
- **Total Records:** 5000
- **Exact Row Duplicates:** 0
- **Duplicate IDs Across Datasets:** 5

| Duplicate ID | Files Sharing ID | Reason |
| :--- | :--- | :--- |
| `CB035` | CB.csv, TR.csv | Misassigned ID prefix in source file |
| `ED009` | ED.csv, TC.csv | Misassigned ID prefix in source file |
| `ED028` | CB.csv, ED.csv, TC.csv | Misassigned ID prefix in source file |
| `ED482` | ED.csv, TC.csv | Misassigned ID prefix in source file |

### 2. Duplicate Text Findings
- **Unique Duplicate Text Phrases:** 165
- **Phrases Shared Across Different Datasets:** 149
- **Phrases Duplicated Within Same Dataset Only:** 16

**Cross-File Sharing Patterns:**
- `5` text phrases shared across: `FD.csv, GR.csv`
- `101` text phrases shared across: `CB.csv, TC.csv, TR.csv`
- `19` text phrases shared across: `CB.csv, TR.csv`
- `22` text phrases shared across: `CB.csv, CS.csv, TC.csv, TR.csv`
- `1` text phrases shared across: `CS.csv, TR.csv`
- `1` text phrases shared across: `CB.csv, CS.csv`

### 3. Global Distributions

#### Sentiment Distribution
| Sentiment | Count | Percentage | Note |
| :--- | :--- | :--- | :--- |
| `negative` | 1,697 | 33.94% | Valid |
| `positive` | 1,359 | 27.18% | Valid |
| `neutral` | 1,154 | 23.08% | Valid |
| `mixed` | 789 | 15.78% | Valid |
| `low` | 1 | 0.02% | ⚠️ Malformed (Severity leaked into Sentiment) |

#### Language Distribution
| Language | Count | Percentage |
| :--- | :--- | :--- |
| `english` | 3,601 | 72.02% |
| `hinglish` | 1,399 | 27.98% |

#### Behavior Distribution
| Behavior | Count | Percentage | Note |
| :--- | :--- | :--- | :--- |
| `complaint` | 2,089 | 41.78% | Valid standard |
| `appreciation` | 1,490 | 29.80% | Valid standard |
| `question` | 727 | 14.54% | Valid standard |
| `suggestion` | 520 | 10.40% | Valid standard |
| `informational` | 174 | 3.48% | Valid domain extension |

#### Abuse Distribution
| Abuse Level | Count | Percentage |
| :--- | :--- | :--- |
| `none` | 4,631 | 92.62% |
| `mild` | 204 | 4.08% |
| `severe` | 165 | 3.30% |

#### Severity Distribution
| Severity Level | Count | Percentage |
| :--- | :--- | :--- |
| `none` | 2,527 | 50.54% |
| `medium` | 876 | 17.52% |
| `low` | 822 | 16.44% |
| `high` | 775 | 15.50% |

#### Complexity Distribution
| Complexity | Count | Percentage | Note |
| :--- | :--- | :--- | :--- |
| `moderate` | 3,053 | 61.06% | Valid standard label |
| `simple` | 1,332 | 26.64% | Valid standard label |
| `complex` | 243 | 4.86% | Valid standard label |
| `medium` | 3 | 0.06% | Typo for `moderate` in ED272, HC272, TC272 |
| *Shifted suggestions* | 369 | 7.38% | 11-field rows where suggestion landed in complexity |

### 4. Service Consistency Findings
- `data/raw/food_delivery/FD.csv`: Contains both `food_delivery` (348 records) and `restaurant` (152 records). This aligns with the dual domain defined in `DATASET_DESIGN.md`.
- `data/raw/telecom/TC.csv`: Uses `telecom_internet` (500 records), aligning with the folder and domain scope.
- `data/raw/banking_upi/BK.csv`: Contains 1 record (`BK085`) labeled as `ecommerce` despite banking text ("cheque deposit").
- `data/raw/cab_transport/CB.csv`: Contains 1 record (`CB217`) labeled as `telecom_internet` with broadband billing text.

---

## Data Quality Issues

### CRITICAL
> *Issues that completely prevent reliable model training or pipeline execution if unaddressed.*

1. **Malformed Sentiment Label in `FD034` (`FD.csv` row 35):**
   - Sentiment is populated as `'low'` instead of `'negative'` (duplicated from severity).
   - Impact: Model training on sentiment would treat `'low'` as a fifth distinct sentiment class with N=1 sample.

### WARNING
> *Systematic formatting or schema irregularities that require normalization in Phase 3.*

1. **Missing 12th Column / Field Shift in 369 Rows:**
   - Across all 10 files (34–40 rows per file), raw lines contain 11 comma-separated fields instead of 12.
   - The `complexity` value was omitted, causing the free-text suggestion to be placed in `complexity` and `suggestion` to parse as `NaN`.
   - Impact: Does not affect text or sentiment training, but corrupts `complexity` and `suggestion` features if uncleaned.
2. **Duplicate IDs Across Datasets (5 Instances):**
   - `ED028` in `CB.csv`, `ED009` / `ED028` / `ED482` in `TC.csv`, and `CB035` in `TR.csv` clash with legitimate records in `ED.csv` and `CB.csv`.
   - Cause: Typographical prefix errors during dataset generation.
3. **Cross-Service Record Bleed (2 Records):**
   - `BK085` in `BK.csv` has `service = 'ecommerce'`.
   - `CB217` in `CB.csv` has `service = 'telecom_internet'` with broadband complaint text.
4. **Cross-Dataset Text Duplication (149 Shared Phrases):**
   - High phrase overlap between `cab_transport`, `telecom`, `travel_hotels`, and `customer_support` due to template replication.
5. **Complexity Typo (`medium` instead of `moderate` in 3 Records):**
   - `ED272`, `HC272`, `TC272` have `complexity = 'medium'` instead of `'moderate'`.

### OBSERVATION
> *Valid variations or domain characteristics that are expected and should be preserved.*

1. **Behavior Category `informational` (174 Records):**
   - Found across all 10 datasets (16–20 per file). Represents neutral, factual status statements without complaint or appreciation. Completely valid domain addition.
2. **Dual Service Labels in Food Delivery:**
   - `FD.csv` contains `food_delivery` (348) and `restaurant` (152), matching real-world platform scopes (ordering app vs dining experience).
3. **Language Code-Mixing:**
   - 1,399 records (28.0%) use Roman Hinglish, distributed organically across all 10 services.
4. **Zero Empty Texts & Zero Truncation:**
   - All 5,000 feedback texts are non-empty, well-formed, and range from 14 to 151 characters (average ~107.6 chars).

---

## Recommendations (For Phase 3 Processing Pipeline)

*(Note: In accordance with Phase 2 constraints, NO changes have been applied to the raw CSVs. These recommendations are for the Phase 3 preprocessing step.)*

1. **Fix `FD034` Sentiment in Pipeline:** In the Phase 3 ingestion cleaner, map `sentiment = 'low'` to `sentiment = 'negative'` (since text describes an unfulfilled request).
2. **Resolve Shifted 11-Column Rows:** During Phase 3 processing, identify rows where `suggestion.isna()` and `complexity` contains free-text recommendations; restore the text to `suggestion` and impute `complexity` (e.g. `moderate` or infer from character length).
3. **Standardize Complexity:** Normalize `medium` → `moderate` in `ED272`, `HC272`, `TC272`.
4. **Regenerate Clean Unique IDs:** In the combined Phase 3 training dataset, generate a consistent composite key (e.g., `<SERVICE_CODE>_<ROW_NUM>`) to eliminate cross-file ID collisions.
5. **Deduplicate Cross-Service Template Texts:** Drop exact duplicate texts occurring across multiple services during dataset consolidation to prevent train/test data leakage.
6. **Retain Raw Datasets As-Is:** Keep all 10 files in `data/raw/` untouched as immutable sources of truth.
