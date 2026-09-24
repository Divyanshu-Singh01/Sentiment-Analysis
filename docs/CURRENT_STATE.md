# Current State

> **This document reflects the actual repository state as of the `improve-sentiment-analysis` branch.**
> Nothing here is assumed — every detail was verified by inspecting actual files.

---

## Current Folder Structure

```
Sentiment Analysis/
├── manage.py                         # Django management script
├── db.sqlite3                        # SQLite database (default, not actively used)
│
├── config/                           # Django project configuration
│   ├── __init__.py
│   ├── settings.py                   # Django 6.1, INSTALLED_APPS: sentiment, analyzer, rest_framework
│   ├── urls.py                       # Root URL config → includes analyzer.urls
│   ├── asgi.py
│   └── wsgi.py
│
├── analyzer/                         # Django app — REST API endpoint
│   ├── urls.py                       # POST /api/predict/
│   └── views.py                      # predict_sentiment view (loads model, runs inference)
│
├── sentiment/                        # Django app — ML scripts (not served via API)
│   ├── __init__.py
│   ├── apps.py                       # SentimentConfig
│   ├── admin.py                      # Empty
│   ├── models.py                     # Empty (no Django models defined)
│   ├── views.py                      # Empty (no views — scripts are standalone)
│   ├── tests.py                      # Empty
│   ├── migrations/
│   │   └── __init__.py
│   ├── preprocessing.py              # Loads raw TSV → cleans text → saves cleaned CSV
│   ├── data_check.py                 # Loads raw TSV → prints stats
│   ├── tfidf_test.py                 # Loads cleaned CSV → tests TF-IDF vectorization
│   ├── train_test_split.py           # Loads cleaned CSV → prints train/test split stats
│   ├── train_model.py                # Loads cleaned CSV → trains LogisticRegression → saves .pkl
│   └── evaluate_model.py             # Loads cleaned CSV + .pkl → prints accuracy/report
│
├── data/                             # Datasets
│   ├── BK.csv                        # Banking/UPI (500 records)
│   ├── CB.csv                        # Cab/Transport (500 records)
│   ├── CS.csv                        # Customer Support (500 records)
│   ├── EC.csv                        # E-commerce (500 records)
│   ├── ED.csv                        # Education (500 records)
│   ├── FD.csv                        # Food Delivery (500 records)
│   ├── GR.csv                        # Grocery Delivery (500 records)
│   ├── HC.csv                        # Healthcare (500 records)
│   ├── TC.csv                        # Telecom/Internet (500 records)
│   └── TR.csv                        # Travel/Hotels (500 records)
│   [DELETED from working tree:]
│   ├── sentiment_dataset.csv         # Original ~1000-record TSV (in Git history)
│   └── cleaned_sentiment_dataset.csv # Preprocessed version (in Git history)
│
├── ml/                               # Model artifacts (UNTRACKED — see note below)
│   ├── sentiment_model.pkl           # Trained LogisticRegression model
│   └── tfidf_vectorizer.pkl          # Fitted TF-IDF vectorizer
│   [In Git history as model/ — see note below]
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
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Main app component (state management, layout)
│   │   ├── App.css                   # Empty (styles via Tailwind)
│   │   ├── index.css                 # Tailwind import, Inter font, result animation
│   │   ├── lib/
│   │   │   └── utils.js              # cn() utility (clsx + tailwind-merge)
│   │   ├── services/
│   │   │   └── sentimentApi.js       # API client — POST /api/predict/
│   │   └── components/
│   │       ├── Header.jsx            # App header with "Model ready" indicator
│   │       ├── SentimentForm.jsx     # Text input form with examples, char count
│   │       ├── SentimentResult.jsx   # Result display (positive=green, negative=red)
│   │       ├── SentimentError.jsx    # Error/warning display
│   │       ├── InitialState.jsx      # Empty state prompt
│   │       └── ui/
│   │           ├── Button.jsx        # Reusable button (variants, loading state)
│   │           ├── Card.jsx          # Reusable card wrapper
│   │           └── Textarea.jsx      # Reusable textarea
│   ├── dist/                         # Built output (gitignored)
│   └── node_modules/                 # Dependencies (gitignored)
│
└── venv/                             # Python virtual environment (not tracked)
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

---

## Current Backend

- **Framework:** Django 6.1.1 with Django REST Framework.
- **Project Config:** `config/` directory (`settings.py`, `urls.py`, etc.).
- **Django Apps:**
  - `analyzer` — Contains the only active API endpoint.
  - `sentiment` — Registered in `INSTALLED_APPS` but contains only standalone
    ML scripts. No views, no models, no URLs.
- **Database:** SQLite (default). No custom models. Not actively used by the app.
- **CORS:** No CORS middleware configured (not needed because Vite proxies in dev).

---

## Current API

| Method | Endpoint        | Request Body          | Response                         |
| ------ | --------------- | --------------------- | -------------------------------- |
| POST   | `/api/predict/` | `{ "text": "..." }`   | `{ "sentiment": "positive" }` or `{ "sentiment": "negative" }` |
| POST   | `/api/predict/` | `{ "text": "" }`      | `{ "error": "Please enter some text to analyze." }` (400) |

- Single endpoint, single view function.
- Uses DRF `@api_view(["POST"])` decorator.
- Model and vectorizer are loaded at module import time (global scope).
- Text preprocessing in the view is minimal: `.lower()` only.

---

## Current ML Model

- **Algorithm:** Logistic Regression (`sklearn.linear_model.LogisticRegression`, `max_iter=1000`).
- **Features:** TF-IDF (`sklearn.feature_extraction.text.TfidfVectorizer`, default params).
- **Classification:** Binary — `positive` or `negative`.
- **Training Data:** ~1,000 movie/product reviews from the original
  `sentiment_dataset.csv` (tab-separated, 2 columns: text + sentiment).
- **Preprocessing Pipeline** (in `sentiment/preprocessing.py`):
  1. Load tab-separated file.
  2. Lowercase text.
  3. Remove non-alphabetic characters.
  4. Collapse whitespace.
  5. Save as `cleaned_sentiment_dataset.csv` (3 columns: text, sentiment, clean_text).
- **Training Pipeline** (in `sentiment/train_model.py`):
  1. Load cleaned CSV.
  2. 80/20 stratified train/test split (`random_state=42`).
  3. Fit TF-IDF on training data.
  4. Train Logistic Regression on TF-IDF features.
  5. Save model + vectorizer as `.pkl` via `joblib`.
- **Serialization:** `joblib` `.pkl` files.
- **scikit-learn Version:** Model was saved with v1.9.1; local environment has v1.9.0
  (minor version mismatch warning).

---

## Current Dataset Location

### In Working Tree (`data/`)
- 10 new service CSV files: `BK.csv`, `CB.csv`, `CS.csv`, `EC.csv`, `ED.csv`,
  `FD.csv`, `GR.csv`, `HC.csv`, `TC.csv`, `TR.csv`.
- Each has 500 records + 1 header line = 501 lines.
- 12 columns: id, text, language, service, behavior, sentiment, aspect, issue,
  severity, abuse, complexity, suggestion.
- These files are **untracked** by Git.

### In Git History (Deleted from Working Tree)
- `data/sentiment_dataset.csv` — Original ~1,000-record TSV (text + sentiment).
- `data/cleaned_sentiment_dataset.csv` — Cleaned version (text + sentiment + clean_text).
- Both show as `D` (deleted) in `git status`.

---

## Current Dataset Format

### New Datasets (CSV, comma-separated)
```csv
id,text,language,service,behavior,sentiment,aspect,issue,severity,abuse,complexity,suggestion
FD001,"Food was good.",english,food_delivery,appreciation,positive,food_quality,none,none,none,simple,none
```

### Original Dataset (TSV, tab-separated — Git history only)
```tsv
text	sentiment
A very, very, very slow-moving, aimless movie...	negative
```

---

## Current Dependencies

### Python (Backend)
Verified from imports in source code:
- `django` (6.1.1)
- `djangorestframework`
- `scikit-learn` (1.9.x)
- `pandas`
- `joblib`

No `requirements.txt` or `pyproject.toml` file exists in the repository.

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
3. ✅ Django API endpoint at `POST /api/predict/` exists.
4. ✅ ML model (LogisticRegression + TF-IDF) is serialized as `.pkl` files.
5. ✅ Frontend correctly displays positive (green) and negative (red) results.
6. ✅ Error handling works (empty input, API errors).
7. ✅ UI has loading states, example text, character count, keyboard shortcuts.
8. ✅ The 10 new service datasets exist with proper 12-column structure.

---

## Known Issues

### 1. Model Directory Mismatch ⚠️
- `analyzer/views.py` loads model from `BASE_DIR / "model"`.
- Git tracks the model files under `model/`.
- But in the working tree, the directory is named `ml/` (untracked).
- The original `model/` directory has been deleted from the working tree
  (shows as `D model/sentiment_model.pkl` and `D model/tfidf_vectorizer.pkl`
  in `git status`).
- **Result:** The Django API will crash on startup because `model/` does not
  exist. The model files are in `ml/` but the code expects `model/`.

### 2. No Root `.gitignore`
- There is no `.gitignore` at the project root.
- `venv/`, `__pycache__/`, `db.sqlite3`, and `.pyc` files could get committed.
- `__pycache__` directories and `.pyc` files are already tracked in Git.

### 3. No `requirements.txt`
- Python dependencies are not documented in a file.
- A new developer would not know what to `pip install`.

### 4. Original Training Data Deleted
- The datasets the current model was trained on (`sentiment_dataset.csv`,
  `cleaned_sentiment_dataset.csv`) have been deleted from the working tree.
- The ML scripts (`preprocessing.py`, `train_model.py`, `evaluate_model.py`, etc.)
  reference these deleted files and will fail if run.
- The `.pkl` model files still exist (in `ml/`) so inference works, but
  retraining is not possible without restoring the data or updating paths.

### 5. Model Version Mismatch (Minor)
- The model `.pkl` was saved with scikit-learn 1.9.1 but the local environment
  has 1.9.0. This produces a warning but does not break functionality.

### 6. Training Code Path Inconsistency
- `sentiment/train_model.py` saves to `BASE_DIR / "model"`.
- `sentiment/preprocessing.py` reads from `BASE_DIR / "data" / "sentiment_dataset.csv"`.
- Both paths reference files that no longer exist in the working tree.

---

## Missing Pieces

1. **Root `.gitignore`** — Does not exist.
2. **`requirements.txt`** — Python dependencies are undocumented.
3. **Project `README.md`** — No root README (only `frontend/README.md` which is
   the default Vite template).
4. **CORS configuration** — Not needed for dev (Vite proxy), but would be needed
   for any other deployment.
5. **Validation scripts for new datasets** — The 10 new CSVs have not been validated.
6. **Processing pipeline for new datasets** — No code exists to combine/preprocess
   the 10 new CSVs for training.
7. **Multi-class support** — The model only predicts positive/negative. The new
   datasets include neutral and mixed sentiments.
8. **Rich response fields** — The API only returns `sentiment`. The new datasets
   have 12 columns of annotations.

---

## Differences Between Current State and Planned Design

| Aspect                  | Current State                              | Planned Design                           |
| ----------------------- | ------------------------------------------ | ---------------------------------------- |
| Sentiment classes       | 2 (positive, negative)                     | 4 (positive, negative, neutral, mixed)   |
| Training data           | ~1,000 generic reviews (deleted)           | 5,000 service-specific records (10 CSVs) |
| Dataset columns         | 2 (text, sentiment)                        | 12 (id, text, language, service, ...)    |
| API response             | `{ sentiment }` only                       | Multiple fields (aspect, severity, etc.) |
| Model directory         | `model/` (in Git) / `ml/` (working tree)   | Needs to be resolved to one name         |
| ML scripts              | Reference deleted files                    | Should reference new datasets            |
| UI result display       | Binary positive/negative only              | Multi-class + structured info            |
| Dependency documentation | None                                      | `requirements.txt` at minimum            |
| Root `.gitignore`       | Missing                                    | Should exist                             |

---

## Git Status Summary

- **Branch:** `improve-sentiment-analysis` (active)
- **Commits:** 1 (`42e7ac3 sentiment analysis app with Django REST API and frontend`)
- **Deleted from working tree:** `data/sentiment_dataset.csv`,
  `data/cleaned_sentiment_dataset.csv`, `model/sentiment_model.pkl`,
  `model/tfidf_vectorizer.pkl`
- **Untracked:** `data/BK.csv` through `data/TR.csv` (10 files), `ml/` directory
- **Tracked but shouldn't be:** `__pycache__/` directories, `.pyc` files
