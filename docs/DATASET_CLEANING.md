# Dataset Cleaning and Normalization Report (Phase 3)

## 1. Overview & Objectives

- **Phase Objective:** Transform 10 raw service datasets into a single, clean, standardized, and training-ready dataset.
- **Raw Data Immutability:** 100% preserved. All 10 raw CSV files in `data/raw/` remain untouched.
- **Pipeline Architecture:** `data/raw/` → `ml/preprocessing/clean_datasets.py` → `data/processed/sentiment_dataset.csv`.
- **Output Location:** `data/processed/sentiment_dataset.csv`

---

## 2. Dataset Ingestion Summary

- **Input Datasets:** 10 service domain files under `data/raw/`
- **Total Input Records:** 5,000
- **Total Output Records:** 5,000
- **Excluded Records:** 0 (all 5,000 records successfully cleaned and retained)

| Service Domain | Raw File | Input Records | Cleaned Output Records | Excluded |
| :--- | :--- | :--- | :--- | :--- |
| BK | `data/raw/*/BK.csv` | 500 | 500 | 0 |
| CB | `data/raw/*/CB.csv` | 500 | 500 | 0 |
| CS | `data/raw/*/CS.csv` | 500 | 500 | 0 |
| EC | `data/raw/*/EC.csv` | 500 | 500 | 0 |
| ED | `data/raw/*/ED.csv` | 500 | 500 | 0 |
| FD | `data/raw/*/FD.csv` | 500 | 500 | 0 |
| GR | `data/raw/*/GR.csv` | 500 | 500 | 0 |
| HC | `data/raw/*/HC.csv` | 500 | 500 | 0 |
| TC | `data/raw/*/TC.csv` | 500 | 500 | 0 |
| TR | `data/raw/*/TR.csv` | 500 | 500 | 0 |

---

## 3. Transformations & Corrections Applied

### A. Shifted 11-Column Row Reconstruction (369 Records)
- **Issue Discovered in Phase 2:** In 369 rows across all 10 raw datasets, the `complexity` column was omitted during data creation, shifting the free-text `suggestion` string into the `complexity` column and leaving `suggestion` as `NaN`.
- **Deterministic Repair Applied:**
  1. The free-text suggestion in the 11th position was restored to the `suggestion` column.
  2. `complexity` was reconstructed deterministically based on character length according to the criteria defined in `docs/DATASET_DESIGN.md`:
     - Text length < 85 characters → `'simple'` (short, direct complaint: 23 records)
     - Text length 85 to 125 characters → `'moderate'` (normal length, standard: 288 records)
     - Text length > 125 characters → `'complex'` (long, multi-clause statement: 58 records)
- **Result:** 0 missing values in `suggestion`, 100% valid `complexity` categories.

### B. Sentiment Label Correction (1 Record)
- **Record:** `FD034` in `FD.csv`
- **Text:** *"bhai cutlery opt out kiya tha fir bhi plastic spoons bhej diye"*
- **Original Sentiment:** `'low'` (duplicated from `severity = 'low'`)
- **Corrected Sentiment:** `'negative'`
- **Justification:** User expresses grievance regarding unfulfilled cutlery opt-out preference; behavior is `'complaint'`; sentiment is unambiguously negative.

### C. Complexity Typo Normalization (3 Records)
- **Records:** `ED272` (Education), `HC272` (Healthcare), `TC272` (Telecom)
- **Original Complexity:** `'medium'`
- **Normalized Complexity:** `'moderate'`
- **Justification:** Canonical schema defines `simple`, `moderate`, `complex`. `'medium'` is a typographical synonym for `'moderate'`.

### D. Cross-Dataset Duplicate ID Resolution (5 Records)
- **Root Cause:** Typographical errors in ID prefixes during raw file generation.
- **Corrections Applied:**
  1. `CB.csv` row 28: `ED028` → `CB028` (restores complete sequence `CB001..CB500`)
  2. `TC.csv` row 9: `ED009` → `TC009` (restores complete sequence `TC001..TC500`)
  3. `TC.csv` row 28: `ED028` → `TC028`
  4. `TC.csv` row 482: `ED482` → `TC482`
  5. `TR.csv` row 35: `CB035` → `TR035` (restores complete sequence `TR001..TR500`)
- **Result:** Total duplicate IDs across processed dataset: **0**.

### E. Service Domain Mismatch Correction (2 Records)
- **Record 1 (`BK085` in `BK.csv`):**
  - *Text:* "bhai cheque deposit kiya tha drop box me 4 din pehle abhi tak clearing update nahi aaya"
  - *Original Service:* `'ecommerce'` → *Corrected Service:* `'banking_upi'`
  - *Justification:* Check clearance in drop box is purely banking domain.
- **Record 2 (`CB217` in `CB.csv`):**
  - *Text:* "Customer support desk took twelve days to respond to my complaint regarding a driver overcharging for toll taxes, useless team."
  - *Original Service:* `'telecom_internet'` → *Corrected Service:* `'cab_transport'`
  - *Justification:* Driver overcharging toll taxes is purely cab transport domain.

### F. Domain & Category Preservations
- **`informational` Behavior Category:** Preserved all 174 records across all 10 datasets. Represents factual, non-complaint status statements.
- **Dual Service Domains in Food Delivery:** Preserved both `food_delivery` (348 records) and `restaurant` (152 records).
- **Duplicate Text Phrases:** Preserved without aggressive deletion in accordance with Phase 3 instructions (149 shared cross-service phrases detected and reported).

---

## 4. Final Dataset Validation & Statistics

### A. Schema & Integrity
- **Total Records:** 5,000
- **Columns:** 12 columns (`id, text, language, service, behavior, sentiment, aspect, issue, severity, abuse, complexity, suggestion`)
- **Column Order:** 100% matching canonical schema
- **Total Missing Values:** 0 (0 missing values across all columns)
- **Empty Text Records:** 0
- **Duplicate IDs:** 0
- **Duplicate Rows:** 0

### B. Final Category Distributions

#### Sentiment Distribution (Target Variable)
| Sentiment | Count | Percentage |
| :--- | :--- | :--- |
| `negative` | 1,698 | 33.96% |
| `positive` | 1,359 | 27.18% |
| `neutral` | 1,154 | 23.08% |
| `mixed` | 789 | 15.78% |

#### Language Distribution
| Language | Count | Percentage |
| :--- | :--- | :--- |
| `english` | 3,601 | 72.02% |
| `hinglish` | 1,399 | 27.98% |

#### Behavior Distribution
| Behavior | Count | Percentage |
| :--- | :--- | :--- |
| `complaint` | 2,089 | 41.78% |
| `appreciation` | 1,490 | 29.80% |
| `question` | 727 | 14.54% |
| `suggestion` | 520 | 10.40% |
| `informational` | 174 | 3.48% |

#### Complexity Distribution
| Complexity | Count | Percentage |
| :--- | :--- | :--- |
| `moderate` | 3,344 | 66.88% |
| `simple` | 1,355 | 27.10% |
| `complex` | 301 | 6.02% |

#### Severity Distribution
| Severity | Count | Percentage |
| :--- | :--- | :--- |
| `none` | 2,527 | 50.54% |
| `medium` | 876 | 17.52% |
| `low` | 822 | 16.44% |
| `high` | 775 | 15.50% |

#### Abuse Distribution
| Abuse | Count | Percentage |
| :--- | :--- | :--- |
| `none` | 4,631 | 92.62% |
| `mild` | 204 | 4.08% |
| `severe` | 165 | 3.30% |

#### Service Distribution
| Service | Count | Percentage |
| :--- | :--- | :--- |
| `banking_upi` | 500 | 10.00% |
| `cab_transport` | 500 | 10.00% |
| `customer_support` | 500 | 10.00% |
| `ecommerce` | 500 | 10.00% |
| `education` | 500 | 10.00% |
| `grocery_delivery` | 500 | 10.00% |
| `healthcare` | 500 | 10.00% |
| `telecom_internet` | 500 | 10.00% |
| `travel_hotels` | 500 | 10.00% |
| `food_delivery` | 348 | 6.96% |
| `restaurant` | 152 | 3.04% |

---

## 5. Duplicate Text Analysis
- **Total Rows with Duplicate Text:** 497
- **Unique Duplicate Text Phrases:** 165
- **Phrases Shared Across Multiple Services:** 149
- **Phrases Duplicated Within Single Service Only:** 16

**Major Cross-Service Text Sharing Clusters:**
- `5` phrases shared across: `FD.csv, GR.csv`
- `101` phrases shared across: `CB.csv, TC.csv, TR.csv`
- `19` phrases shared across: `CB.csv, TR.csv`
- `22` phrases shared across: `CB.csv, CS.csv, TC.csv, TR.csv`
- `1` phrases shared across: `CS.csv, TR.csv`
- `1` phrases shared across: `CB.csv, CS.csv`

---

## 6. Pipeline Reproducibility

To reproduce the entire dataset processing pipeline at any time, run:

```bash
python ml/preprocessing/clean_datasets.py
```

Output artifacts created:
- `data/processed/sentiment_dataset.csv` (Canonical cleaned training dataset)
- `data/processed/cleaning_log.json` (Structured machine-readable log of all modifications)
- `docs/DATASET_CLEANING.md` (Human-readable cleaning report)
