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
│   ├── raw/                          # Raw service datasets (unmodified originals)
│   │   ├── banking_upi/
│   │   │   └── BK.csv               # Banking/UPI (500 records)
│   │   ├── cab_transport/
│   │   │   └── CB.csv               # Cab/Transport (500 records)
│   │   ├── customer_support/
│   │   │   └── CS.csv               # Customer Support (500 records)
│   │   ├── ecommerce/
│   │   │   └── EC.csv               # E-commerce (500 records)
│   │   ├── education/
│   │   │   └── ED.csv               # Education (500 records)
│   │   ├── food_delivery/
│   │   │   └── FD.csv               # Food Delivery (500 records)
│   │   ├── grocery_delivery/
│   │   │   └── GR.csv               # Grocery Delivery (500 records)
│   │   ├── healthcare/
│   │   │   └── HC.csv               # Healthcare (500 records)
│   │   ├── telecom/
│   │   │   └── TC.csv               # Telecom/Internet (500 records)
│   │   └── travel_hotels/
│   │       └── TR.csv               # Travel/Hotels (500 records)
│   └── processed/                    # Processed training dataset (sentiment_dataset.csv, cleaning_log.json)
│
├── ml/                               # Machine learning code and artifacts
│   ├── models/                       # Serialized model artifacts
│   │   ├── sentiment_model.pkl       # Trained LogisticRegression (gitignored)
│   │   └── tfidf_vectorizer.pkl      # Fitted TF-IDF vectorizer (gitignored)
│   ├── preprocessing/                # Data preprocessing scripts
│   │   ├── preprocessing.py          # Text cleaning pipeline
│   │   ├── data_check.py            # Dataset inspection/stats
│   │   ├── validate_datasets.py     # Reusable dataset validator (Phase 2)
│   │   └── clean_datasets.py        # Dataset cleaning & normalization pipeline (Phase 3)
│   ├── training/                     # Model training scripts
│   │   ├── train_model.py            # Train LogisticRegression + TF-IDF
│   │   ├── train_test_split.py       # Check train/test split distribution
│   │   └── tfidf_test.py            # Test TF-IDF vectorization
│   └── evaluation/                   # Model evaluation scripts
│       └── evaluate_model.py         # Accuracy, classification report, confusion matrix
│
├── docs/                             # Project documentation
│   ├── PROJECT.md                    # Project purpose and scope
│   ├── SYSTEM_DESIGN.md              # Architecture and data flow
│   ├── DATASET_DESIGN.md             # Dataset structure and column specs
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
| `banking_upi/`        | BK.csv  | 500     |
| `cab_transport/`      | CB.csv  | 500     |
| `customer_support/`   | CS.csv  | 500     |
| `ecommerce/`          | EC.csv  | 500     |
| `education/`          | ED.csv  | 500     |
| `food_delivery/`      | FD.csv  | 500     |
| `grocery_delivery/`   | GR.csv  | 500     |
| `healthcare/`         | HC.csv  | 500     |
| `telecom/`            | TC.csv  | 500     |
| `travel_hotels/`      | TR.csv  | 500     |

Each has 12 columns: id, text, language, service, behavior, sentiment, aspect,
issue, severity, abuse, complexity, suggestion.

### Processed Data (`data/processed/`)
Empty. Will be populated in Phase 3 when the raw datasets are processed for
ML training.

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

---

## Known Issues (Remaining)

### 1. ML Scripts Not Yet Runnable on New Dataset
- The processed dataset `data/processed/sentiment_dataset.csv` is ready.
- The ML training scripts (`train_model.py`, `evaluate_model.py`) currently still have legacy 2-column paths and will be updated in Phase 4 to train on the new 4-class multi-service dataset.

### 2. Model Version Mismatch (Minor)
- The model `.pkl` was saved with scikit-learn 1.9.1 but the local environment
  has 1.9.0. This produces a warning but does not break functionality.

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
| Training data           | ~1,000 generic reviews (model artifact)    | 5,000 service-specific records (10 CSVs) |
| Dataset columns         | Model trained on 2 cols (text, sentiment)  | 12 (id, text, language, service, ...)    |
| API response            | `{ sentiment }` only                       | Multiple fields (aspect, severity, etc.) |
| ML scripts              | Ready for Phase 4 retraining update        | Full pipeline for new datasets           |
| UI result display       | Binary positive/negative only              | Multi-class + structured info            |
| Processed dataset       | `data/processed/sentiment_dataset.csv`     | Combined, cleaned training CSV           |

---

## Git Status Summary

- **Branch:** `improve-sentiment-analysis` (active)
- **`.gitignore` rules:** `venv/`, `__pycache__/`, `*.pyc`, `db.sqlite3`,
  `ml/models/*.pkl`, IDE files, OS files
