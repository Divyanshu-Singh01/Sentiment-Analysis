# Current State

> **This document reflects the actual repository state after Phase 1 (Project Organization).**
> Nothing here is assumed — every detail was verified by inspecting actual files.

---

## Current Folder Structure

```
Sentiment Analysis/
├── .gitignore                        # Root gitignore (venv, __pycache__, db.sqlite3, .pkl)
├── manage.py                         # Django management script
├── requirements.txt                  # Python dependencies
├── db.sqlite3                        # SQLite database (gitignored, not actively used)
│
├── config/                           # Django project configuration
│   ├── __init__.py
│   ├── settings.py                   # Django 6.1, INSTALLED_APPS: analyzer, rest_framework
│   ├── urls.py                       # Root URL config → includes analyzer.urls
│   ├── asgi.py
│   └── wsgi.py
│
├── analyzer/                         # Django app — REST API endpoint
│   ├── urls.py                       # POST /api/predict/
│   └── views.py                      # predict_sentiment view (loads model from ml/models/)
│
├── data/                             # All datasets
│   ├── raw/                          # Raw service datasets (expanded from 600 to 800 records each in Phase 6.4)
│   │   ├── banking_upi/
│   │   │   └── BK.csv               # Banking/UPI (800 records)
│   │   ├── cab_transport/
│   │   │   └── CB.csv               # Cab/Transport (800 records)
│   │   ├── customer_support/
│   │   │   └── CS.csv               # Customer Support (800 records)
│   │   ├── ecommerce/
│   │   │   └── EC.csv               # E-commerce (800 records)
│   │   ├── education/
│   │   │   └── ED.csv               # Education (800 records)
│   │   ├── food_delivery/
│   │   │   └── FD.csv               # Food Delivery (800 records)
│   │   ├── grocery_delivery/
│   │   │   └── GR.csv               # Grocery Delivery (800 records)
│   │   ├── healthcare/
│   │   │   └── HC.csv               # Healthcare (800 records)
│   │   ├── telecom/
│   │   │   └── TC.csv               # Telecom/Internet (800 records)
│   │   └── travel_hotels/
│   │       └── TR.csv               # Travel/Hotels (800 records)
│   ├── processed/                    # Processed training dataset (sentiment_dataset.csv: 8,000 records, cleaning_log.json)
│   └── test/                         # Independent test datasets
│       └── challenge_dataset.csv     # Phase 6 manually curated challenge set (90 records)
│
├── ml/                               # Machine learning code and artifacts
│   ├── models/                       # Serialized model artifacts
│   │   ├── sentiment_model.pkl       # Trained LogisticRegression (gitignored)
│   │   ├── tfidf_vectorizer.pkl      # Fitted TF-IDF vectorizer (gitignored)
│   │   ├── sentiment_baseline_model.pkl      # Phase 4 baseline model (gitignored)
│   │   ├── sentiment_baseline_vectorizer.pkl # Phase 4 baseline vectorizer (gitignored)
│   │   ├── baseline_metadata.json    # Phase 4 baseline metadata
│   │   ├── sentiment_best_model.pkl  # Phase 5 winning model (Exp 3: Word+Char) (gitignored)
│   │   ├── sentiment_best_vectorizer.pkl # Phase 5 winning vectorizer (gitignored)
│   │   ├── best_model_metadata.json  # Phase 5 winning model metadata
│   │   ├── experiment_results.json   # Phase 5 all 5 experiment metrics
│   │   ├── sentiment_final_model.pkl # Phase 6.6 retrained winning model on 8k records (gitignored)
│   │   ├── sentiment_final_vectorizer.pkl # Phase 6.6 retrained vectorizer (gitignored)
│   │   ├── final_model_metadata.json # Phase 6.6 final model metadata
│   │   └── final_challenge_evaluation.json # Phase 6.6 challenge evaluation results
│   ├── preprocessing/                # Data preprocessing scripts
│   │   ├── preprocessing.py          # Text cleaning pipeline
│   │   ├── data_check.py            # Dataset inspection/stats
│   │   ├── validate_datasets.py     # Reusable dataset validator (Phase 2)
│   │   └── clean_datasets.py        # Dataset cleaning & normalization pipeline (Phase 3)
│   ├── training/                     # Model training scripts
│   │   ├── train_final.py            # Phase 6.6 final model retraining pipeline
│   │   ├── train_experiments.py      # Phase 5 controlled experiments pipeline
│   │   ├── train_baseline.py         # Multi-class baseline training pipeline (Phase 4)
│   │   ├── train_model.py            # Legacy binary training script
│   │   ├── train_test_split.py       # Check train/test split distribution
│   │   └── tfidf_test.py            # Test TF-IDF vectorization
│   └── evaluation/                   # Model evaluation scripts
│       ├── evaluate_final.py        # Phase 6.3 final challenge evaluation & comparison
│       ├── evaluate_challenge.py    # Phase 6 challenge dataset evaluation & report generator
│       ├── evaluate_experiments.py   # Phase 5 experiment evaluation & report generator
│       ├── evaluate_baseline.py      # Baseline evaluation & error analysis (Phase 4)
│       └── evaluate_model.py         # Legacy binary evaluation script
│
├── docs/                             # Project documentation
│   ├── PROJECT.md                    # Project purpose and scope
│   ├── SYSTEM_DESIGN.md              # Architecture and data flow
│   ├── DATASET_DESIGN.md             # Dataset structure and column specs
│   ├── DATASET_VALIDATION.md         # Phase 2 validation report
│   ├── DATASET_CLEANING.md           # Phase 3 cleaning and normalization report
│   ├── ML_BASELINE_EVALUATION.md     # Phase 4 baseline evaluation report
│   ├── ML_IMPROVEMENT_EVALUATION.md  # Phase 5 model improvement evaluation report
│   ├── FINAL_MODEL_VALIDATION.md     # Phase 6 challenge testing report
│   ├── FINAL_MODEL_EVALUATION.md     # Phase 6.3 final retrained model evaluation report
│   ├── IMPLEMENTATION_PLAN.md        # Phase 0–9 improvement plan
│   └── CURRENT_STATE.md              # This file
│
├── frontend/                         # React frontend (Vite)
│   ├── index.html                    # Entry HTML with Inter font, meta tags
│   ├── package.json                  # Dependencies: react 19, tailwindcss 4, lucide-react, vite 8
│   ├── package-lock.json
│   ├── vite.config.js                # React + Tailwind plugins, proxy /api → localhost:8000
│   ├── .gitignore                    # Ignores node_modules, dist, logs
│   ├── .oxlintrc.json                # Linter config
│   ├── README.md                     # Default Vite template README
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Main app component (state management, layout)
│       ├── App.css                   # Empty (styles via Tailwind)
│       ├── index.css                 # Tailwind import, Inter font, result animation
│       ├── lib/
│       │   └── utils.js              # cn() utility (clsx + tailwind-merge)
│       ├── services/
│       │   └── sentimentApi.js       # API client — POST /api/predict/
│       └── components/
│           ├── Header.jsx            # App header with "Model ready" indicator
│           ├── SentimentForm.jsx     # Text input form with examples, char count
│           ├── SentimentResult.jsx   # Result display (positive=green, negative=red)
│           ├── SentimentError.jsx    # Error/warning display
│           ├── InitialState.jsx      # Empty state prompt
│           └── ui/
│               ├── Button.jsx        # Reusable button (variants, loading state)
│               ├── Card.jsx          # Reusable card wrapper
│               └── Textarea.jsx      # Reusable textarea
│
└── venv/                             # Python virtual environment (gitignored)
```

---

## Current Frontend

- **Framework:** React 19 with Vite 8 as bundler.
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin).
- **Icons:** Lucide React.
- **UI Components:** Custom `ui/` components (Button, Card, Textarea) using
  `cn()` utility (`clsx` + `tailwind-merge`).
- **Single Page:** One page with text input, analyze button, and result display.
- **API Client:** `sentimentApi.js` uses `fetch` to POST to `/api/predict/`.
- **Dev Proxy:** Vite proxies `/api` requests to `http://127.0.0.1:8000`.
- **State:** React `useState` only. No routing, no context, no external state library.
- **Result Display:** Binary — positive (green card with check icon) or
  negative (red card with alert icon).
- **Status:** Unchanged in Phase 1. No frontend code was modified.

---

## Current Backend

- **Framework:** Django 6.1.1 with Django REST Framework.
- **Project Config:** `config/` directory (`settings.py`, `urls.py`, etc.).
- **Django Apps:**
  - `analyzer` — Contains the only active API endpoint.
- **Database:** SQLite (default). No custom models. Not actively used by the app.
- **CORS:** No CORS middleware configured (not needed because Vite proxies in dev).

**Note:** The `sentiment` Django app was removed in Phase 1. It had no models,
views, or URLs — it was only a container for ML scripts which have been moved to `ml/`.

---

## Current API

| Method | Endpoint        | Request Body          | Response                         |
| ------ | --------------- | --------------------- | -------------------------------- |
| POST   | `/api/predict/` | `{ "text": "..." }`   | `{ "sentiment": "positive" }` or `{ "sentiment": "negative" }` |
| POST   | `/api/predict/` | `{ "text": "" }`      | `{ "error": "Please enter some text to analyze." }` (400) |

- Single endpoint, single view function.
- Uses DRF `@api_view(["POST"])` decorator.
- Model and vectorizer are loaded at module import time from `ml/models/`.
- Text preprocessing in the view is minimal: `.lower()` only.

---

## Current ML Model

- **Algorithm:** Logistic Regression (`sklearn.linear_model.LogisticRegression`, `max_iter=1000`).
- **Features:** TF-IDF (`sklearn.feature_extraction.text.TfidfVectorizer`, default params).
- **Classification:** Binary — `positive` or `negative`.
- **Training Data:** Was trained on ~1,000 movie/product reviews from the original
  `sentiment_dataset.csv`. Original training data is no longer in the working tree
  (preserved in Git history only).
- **Preprocessing Pipeline** (in `ml/preprocessing/preprocessing.py`):
  1. Load dataset.
  2. Lowercase text.
  3. Remove non-alphabetic characters.
  4. Collapse whitespace.
  5. Save to `data/processed/`.
- **Training Pipeline** (in `ml/training/train_model.py`):
  1. Load processed CSV from `data/processed/`.
  2. 80/20 stratified train/test split (`random_state=42`).
  3. Fit TF-IDF on training data.
  4. Train Logistic Regression on TF-IDF features.
  5. Save model + vectorizer to `ml/models/` via `joblib`.
- **Evaluation** (in `ml/evaluation/evaluate_model.py`):
  Loads model from `ml/models/`, runs accuracy/classification report/confusion matrix.
- **Serialization:** `joblib` `.pkl` files in `ml/models/`.
- **scikit-learn Version:** Model was saved with v1.9.1; local environment has v1.9.0
  (minor version mismatch warning, does not break functionality).

---

## Current Dataset Location

### Raw Datasets (`data/raw/`)
10 service CSV files organized by service domain:

| Service Directory     | File    | Records |
| --------------------- | ------- | ------- |
| `banking_upi/`        | BK.csv  | 800     |
| `cab_transport/`      | CB.csv  | 800     |
| `customer_support/`   | CS.csv  | 800     |
| `ecommerce/`          | EC.csv  | 800     |
| `education/`          | ED.csv  | 800     |
| `food_delivery/`      | FD.csv  | 800     |
| `grocery_delivery/`   | GR.csv  | 800     |
| `healthcare/`         | HC.csv  | 800     |
| `telecom/`            | TC.csv  | 800     |
| `travel_hotels/`      | TR.csv  | 800     |

Each has 12 columns: id, text, language, service, behavior, sentiment, aspect,
issue, severity, abuse, complexity, suggestion.

### Processed Data (`data/processed/`)
Canonical 8,000-record dataset at `data/processed/sentiment_dataset.csv` generated
from the 10 raw datasets via `ml/preprocessing/clean_datasets.py` with 0 missing values,
0 duplicate IDs, and complete normalization logged in `cleaning_log.json`.

### Original Training Data (Git History Only)
- `data/sentiment_dataset.csv` — Original ~1,000-record TSV.
- `data/cleaned_sentiment_dataset.csv` — Cleaned version.
- Both removed from tracking in Phase 1. Available in Git history if needed.

---

## Current Dependencies

### Python (Backend)
Documented in `requirements.txt`:
- `django` >=6.1,<7.0
- `djangorestframework` >=3.15,<4.0
- `scikit-learn` >=1.9,<2.0
- `pandas` >=2.0,<3.0
- `joblib` >=1.4,<2.0

### JavaScript (Frontend)
From `package.json`:
- `react` ^19.2.8
- `react-dom` ^19.2.8
- `tailwindcss` ^4.3.3
- `@tailwindcss/vite` ^4.3.3
- `lucide-react` ^1.47.0
- `clsx` ^2.1.1
- `tailwind-merge` ^3.7.0
- `@vitejs/plugin-react` ^6.1.1 (dev)
- `vite` ^8.3.0 (dev)
- `oxlint` ^1.81.0 (dev)

---

## What Currently Works

1. ✅ React frontend renders and accepts text input.
2. ✅ Vite dev server proxies `/api` to Django.
3. ✅ Django API endpoint at `POST /api/predict/` exists and loads model from `ml/models/`.
4. ✅ ML model prediction works (verified: "I love this product" → "positive").
5. ✅ Frontend correctly displays positive (green) and negative (red) results.
6. ✅ Error handling works (empty input, API errors).
7. ✅ UI has loading states, example text, character count, keyboard shortcuts.
8. ✅ The 10 raw service datasets are organized and intact (500 records each).
9. ✅ ML scripts have correct paths to `data/processed/` and `ml/models/`.
10. ✅ Root `.gitignore` prevents tracking of `venv/`, `__pycache__/`, `db.sqlite3`, `.pkl`.
11. ✅ Python dependencies documented in `requirements.txt`.
12. ✅ Reusable dataset validator (`ml/preprocessing/validate_datasets.py`) verifies all 10 raw datasets; findings documented in `docs/DATASET_VALIDATION.md`.
13. ✅ Cleaned and validated 5,000-record training dataset created at `data/processed/sentiment_dataset.csv` via `ml/preprocessing/clean_datasets.py`; findings documented in `docs/DATASET_CLEANING.md`.
14. ✅ Multi-class baseline model trained (`ml/training/train_baseline.py`) and evaluated (`ml/evaluation/evaluate_baseline.py`) achieving 93.00% accuracy and 0.9343 macro F1; documented in `docs/ML_BASELINE_EVALUATION.md`.
15. ✅ Model improvement experiments conducted (`ml/training/train_experiments.py`, `ml/evaluation/evaluate_experiments.py`); Exp 3 (Combined Word + Character n-grams) achieved **94.70%** accuracy, **0.9487** macro F1, **90.46%** Hinglish accuracy, and **94.91%** strict unseen-text accuracy; documented in `docs/ML_IMPROVEMENT_EVALUATION.md`.
16. ✅ Challenge dataset stress-test completed (`data/test/challenge_dataset.csv`, `ml/evaluation/evaluate_challenge.py`); 90 manually curated adversarial examples targeting known weaknesses; model scored **47.8%** on this deliberately adversarial set — exposed specific data gaps (factual neutrals, subtle complaints, negation, short text, bhai particle); documented in `docs/FINAL_MODEL_VALIDATION.md`.
17. ✅ Phase 6.1 Targeted dataset expansion completed: added exactly 100 new high-quality, service-specific records across all 10 raw datasets (IDs 501–600 per prefix), expanding raw data from 5,000 to 6,000 records targeting identified model blind spots.
18. ✅ Phase 6.2 Processed expanded dataset regenerated via `ml/preprocessing/clean_datasets.py`: 6,000 clean training records with 0 nulls, 0 duplicate IDs, and 100% valid schema and categorical labels saved to `data/processed/sentiment_dataset.csv` and logged in `data/processed/cleaning_log.json`.
19. ✅ Phase 6.3 Retrained final Exp3 model on 6,000 records (`ml/training/train_final.py`) and evaluated on frozen 90-record challenge dataset (`ml/evaluation/evaluate_final.py`). Holdout accuracy: **90.83%** (macro F1: **0.9107**), strict unseen-text accuracy: **91.42%** (macro F1: **0.9123**). On the frozen challenge set, accuracy surged from **47.8% (43/90)** to **66.7% (60/90)**, macro F1 jumped from **0.4316** to **0.6688**, and errors dropped from 47 to 30. Major blind spots resolved: factual/neutral (14.3% → 85.7%), sarcasm (25.0% → 100.0%), "bhai" bias (54.5% → 90.9%), indirect complaints (50.0% → 75.0%), Hinglish challenge (48.6% → 64.9%). Persistent weaknesses identified: polite complaints (20.0%) and short expressions (50.0%). Status: **PARTIAL IMPROVEMENT**. Documented in `docs/FINAL_MODEL_EVALUATION.md`.
20. ✅ Phase 6.4 Targeted dataset expansion: added exactly 2,000 new high-quality, service-specific records across all 10 raw datasets (IDs 601–800 per prefix, 200/service), expanding raw data from 6,000 to 8,000 records targeting remaining weaknesses (polite complaints, ultra-short feedback, transliteration variations, negation, mixed sentiment).
21. ✅ Phase 6.5 Processed expanded dataset regenerated via `ml/preprocessing/clean_datasets.py`: 8,000 clean training records with 0 nulls, 0 duplicate IDs, and 100% valid schema and categorical labels saved to `data/processed/sentiment_dataset.csv` and logged in `data/processed/cleaning_log.json`.
22. ✅ Phase 6.6 Retrained final Exp3 model on 8,000 records (`ml/training/train_final.py`) and evaluated on frozen 90-record challenge dataset (`ml/evaluation/evaluate_final.py`). Standard holdout accuracy: **90.87%** (macro F1: **0.9032**), strict unseen-text accuracy: **90.32%** (macro F1: **0.9015**). On the frozen challenge set, accuracy surged to **73.33% (66/90)**, macro F1 jumped to **0.7293**, and errors dropped from 30 to 24. Key improvements: polite complaints (20.0% → 60.0%), transliteration (75.0% → 100.0%), factual/neutral (85.7% → 100.0%), short expressions (59.3% → 70.4%), and Hinglish challenge accuracy (64.9% → 73.0%). Classification: **CLEAR IMPROVEMENT**. Documented in `docs/FINAL_MODEL_EVALUATION.md`.
23. ✅ Phase 6.7 Final model integration & application validation: Updated Django REST API (`analyzer/views.py`) to load the final 8,000-record model (`sentiment_final_model.pkl`) and vectorizer (`sentiment_final_vectorizer.pkl`). Verified 100% consistency between direct model predictions and Django REST API responses across 10 diverse test cases (positive, negative, neutral, mixed, polite complaint, short text, Hinglish, transliteration, negation). Legacy binary artifacts (`sentiment_model.pkl`, `tfidf_vectorizer.pkl`) verified unreferenced by production code.

---

## Known Issues (Remaining)

### 1. Legacy Model Reference Scripts
- Legacy binary scripts (`train_model.py`, `evaluate_model.py`) and legacy binary artifacts (`sentiment_model.pkl`, `tfidf_vectorizer.pkl`) remain for historical benchmark reference only; application code now exclusively uses the final 8k model.

### 2. Model Version Mismatch (Minor)
- The legacy model `.pkl` was saved with scikit-learn 1.9.1 but the local environment
  has 1.9.0. Final Phase 6.6 model is trained and saved using current scikit-learn 1.9.0.

### 3. No Project README.md
- No root `README.md` exists (only `frontend/README.md` which is the default
  Vite template).

---

## Issues Resolved in Phase 1 & Phase 2 & Phase 3

1. ~~Model Directory Mismatch~~ → Model path in `analyzer/views.py` now correctly
   points to `ml/models/`. Model loads successfully.
2. ~~No Root `.gitignore`~~ → Created at project root.
3. ~~No `requirements.txt`~~ → Created at project root.
4. ~~`__pycache__` tracked in Git~~ → Removed from Git tracking.
5. ~~`db.sqlite3` tracked in Git~~ → Removed from Git tracking.
6. ~~ML scripts mixed into Django app~~ → Moved to `ml/` directory with clear
   subdirectories (preprocessing, training, evaluation).
7. ~~Datasets flat in `data/`~~ → Organized into `data/raw/{service}/`.
8. ~~Old deleted files still in Git index~~ → Removed from tracking
   (`model/*.pkl`, `data/sentiment_dataset.csv`, `data/cleaned_sentiment_dataset.csv`).
9. ~~Raw dataset validation missing~~ → Implemented in `ml/preprocessing/validate_datasets.py`.
10. ~~Raw dataset defects uncleaned~~ → Resolved via deterministic pipeline in `ml/preprocessing/clean_datasets.py` (369 shifted rows repaired, 1 invalid sentiment corrected, 3 complexity typos normalized, 5 duplicate IDs fixed, 2 service mismatches fixed).

---

## Differences Between Current State and Planned Design

| Aspect                  | Current State                              | Planned Design                           |
| ----------------------- | ------------------------------------------ | ---------------------------------------- |
| Sentiment classes       | 2 (positive, negative in current model)    | 4 (positive, negative, neutral, mixed)   |
| Training data           | ~1,000 generic reviews (model artifact)    | 8,000 service-specific records (10 CSVs) |
| Dataset columns         | Model trained on 2 cols (text, sentiment)  | 12 (id, text, language, service, ...)    |
| API response            | `{ sentiment }` only                       | Multiple fields (aspect, severity, etc.) |
| ML scripts              | Ready for Phase 4 retraining update        | Full pipeline for new datasets           |
| UI result display       | Binary positive/negative only              | Multi-class + structured info            |
| Processed dataset       | `data/processed/sentiment_dataset.csv`     | Combined, cleaned training CSV (8,000 records) |

---

## Git Status Summary

- **Branch:** `improve-sentiment-analysis` (active)
- **`.gitignore` rules:** `venv/`, `__pycache__/`, `*.pyc`, `db.sqlite3`,
  `ml/models/*.pkl`, IDE files, OS files
