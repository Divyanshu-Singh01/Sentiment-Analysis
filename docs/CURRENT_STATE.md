# Current State

> **This document reflects the actual repository state after Phase 7 (Final Application Testing) and Phase 8 (Final Documentation).**  
> Implementation is frozen. Everything here is verified against actual codebase files, test logs, and runtime behavior.

---

## Current Folder Structure

```
Sentiment Analysis/
├── .gitignore                        # Root gitignore (venv, __pycache__, db.sqlite3, .pkl)
├── manage.py                         # Django management script
├── requirements.txt                  # Python dependencies
├── README.md                         # Project documentation and guide
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
│   ├── raw/                          # Raw service datasets (800 records each across 10 services = 8,000 total)
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
│       └── challenge_dataset.csv     # Frozen manually curated challenge set (90 records)
│
├── ml/                               # Machine learning code and artifacts
│   ├── models/                       # Serialized model artifacts
│   │   ├── sentiment_final_model.pkl # Active production model: Phase 6.6 Exp3 on 8k records (gitignored)
│   │   ├── sentiment_final_vectorizer.pkl # Active production vectorizer (gitignored)
│   │   ├── final_model_metadata.json # Phase 6.6 final model metadata
│   │   ├── final_challenge_evaluation.json # Phase 6.6 challenge evaluation results
│   │   ├── sentiment_best_model.pkl  # Historical: Phase 5 winning model on 5k records (gitignored)
│   │   ├── sentiment_best_vectorizer.pkl # Historical: Phase 5 vectorizer (gitignored)
│   │   ├── best_model_metadata.json  # Phase 5 winning model metadata
│   │   ├── experiment_results.json   # Phase 5 all 5 experiment metrics
│   │   ├── sentiment_baseline_model.pkl      # Historical: Phase 4 baseline model (gitignored)
│   │   ├── sentiment_baseline_vectorizer.pkl # Historical: Phase 4 baseline vectorizer (gitignored)
│   │   ├── baseline_metadata.json    # Phase 4 baseline metadata
│   │   ├── sentiment_model.pkl       # Historical: Legacy binary model (gitignored)
│   │   └── tfidf_vectorizer.pkl      # Historical: Legacy binary vectorizer (gitignored)
│   ├── preprocessing/                # Data preprocessing scripts
│   │   ├── clean_datasets.py        # Dataset cleaning & normalization pipeline (Phase 3 & Phase 6.5)
│   │   ├── validate_datasets.py     # Reusable dataset validator (Phase 2)
│   │   ├── preprocessing.py          # Legacy text cleaning pipeline
│   │   └── data_check.py            # Dataset inspection/stats
│   ├── training/                     # Model training scripts
│   │   ├── train_final.py            # Phase 6.6 final model training pipeline (active)
│   │   ├── train_experiments.py      # Phase 5 controlled experiments pipeline
│   │   ├── train_baseline.py         # Multi-class baseline training pipeline (Phase 4)
│   │   ├── train_model.py            # Legacy binary training script
│   │   ├── train_test_split.py       # Check train/test split distribution
│   │   └── tfidf_test.py            # Test TF-IDF vectorization
│   └── evaluation/                   # Model evaluation scripts
│       ├── evaluate_final.py        # Phase 6.6 final challenge evaluation & comparison (active)
│       ├── evaluate_challenge.py    # Phase 6 challenge dataset evaluation
│       ├── evaluate_experiments.py   # Phase 5 experiment evaluation & report generator
│       ├── evaluate_baseline.py      # Baseline evaluation & error analysis (Phase 4)
│       └── evaluate_model.py         # Legacy binary evaluation script
│
├── docs/                             # Project documentation
│   ├── PROJECT.md                    # Project purpose and scope
│   ├── SYSTEM_DESIGN.md              # Architecture and data flow
│   ├── DATASET_DESIGN.md             # Dataset structure and column specs
│   ├── DATASET_VALIDATION.md         # Phase 2 validation report
│   ├── DATASET_CLEANING.md           # Phase 3 & 6.5 cleaning and normalization report
│   ├── ML_BASELINE_EVALUATION.md     # Phase 4 baseline evaluation report
│   ├── ML_IMPROVEMENT_EVALUATION.md  # Phase 5 model improvement evaluation report
│   ├── FINAL_MODEL_VALIDATION.md     # Phase 6 challenge testing report
│   ├── FINAL_MODEL_EVALUATION.md     # Phase 6.6 final retrained model evaluation report
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
│           ├── SentimentResult.jsx   # 4-class result display (positive, negative, neutral, mixed)
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
- **Icons:** Lucide React (`Check`, `AlertCircle`, `Minus`, `Scale`).
- **UI Components:** Custom `ui/` components (Button, Card, Textarea) using `cn()` utility (`clsx` + `tailwind-merge`).
- **Single Page:** Single-page dashboard with text input, sample phrases, character count, reset controls, and sentiment card.
- **API Client:** `sentimentApi.js` uses `fetch` to POST to `/api/predict/`.
- **Dev Proxy:** Vite proxies `/api` requests to `http://127.0.0.1:8000`.
- **State:** React `useState` only. No external state management or routing libraries.
- **Result Display:** Multi-class rendering with dedicated visual cards for all four sentiment classes:
  - **Positive:** Emerald styling with `Check` icon (*"Your text has a positive sentiment."*)
  - **Negative:** Rose styling with `AlertCircle` icon (*"Your text has a negative sentiment."*)
  - **Neutral:** Slate styling with `Minus` icon (*"Your text has a neutral or factual tone."*)
  - **Mixed:** Amber styling with `Scale` icon (*"Your text contains both positive and negative aspects."*)
- **Status:** Phase 7 bug resolved: `SentimentResult.jsx` was updated from binary ternary logic to fully map all four sentiment classes.

---

## Current Backend

- **Framework:** Django 6.1.1 with Django REST Framework 3.16.
- **Project Config:** `config/` directory (`settings.py`, `urls.py`, etc.).
- **Django Apps:**
  - `analyzer` — Contains the active API endpoint.
- **Database:** SQLite (default). No custom database models. Not actively used by the app.
- **CORS:** Handled via Vite dev server proxy in development.
- **Active Model Loading:** `analyzer/views.py` loads `ml/models/sentiment_final_model.pkl` and `ml/models/sentiment_final_vectorizer.pkl` at startup.

---

## Current API

| Method | Endpoint        | Request Body          | Response                                                | Status Code |
| ------ | --------------- | --------------------- | ------------------------------------------------------- | ----------- |
| POST   | `/api/predict/` | `{ "text": "..." }`   | `{ "sentiment": "positive" \| "negative" \| "neutral" \| "mixed" }` | 200 OK      |
| POST   | `/api/predict/` | `{ "text": "" }`      | `{ "error": "Please enter some text to analyze." }`     | 400 Bad Request |
| POST   | `/api/predict/` | `{ "text": "   " }`   | `{ "error": "Please enter some text to analyze." }`     | 400 Bad Request |
| POST   | `/api/predict/` | `{}`                  | `{ "error": "Please enter some text to analyze." }`     | 400 Bad Request |

- Single endpoint, single view function (`analyzer/views.py`).
- Uses DRF `@api_view(["POST"])` decorator.
- Model and vectorizer are loaded once at module import time from `ml/models/`.
- Text preprocessing in the view: `.strip().lower()`.
- Validates missing, empty, and whitespace-only text with descriptive HTTP 400 responses.

---

## Current ML Model (Production)

- **Architecture:** Exp3 (FeatureUnion of Word TF-IDF + Character n-grams TF-IDF with Logistic Regression).
- **Algorithm:** Multi-class Logistic Regression (`sklearn.linear_model.LogisticRegression`).
  - `max_iter=1000`
  - `class_weight=None`
  - `random_state=42`
- **Features:** 37,640 combined features via `FeatureUnion`:
  - **Word TF-IDF:** Word unigrams (1,1), `min_df=2`, `sublinear_tf=True` (7,358 features).
  - **Character TF-IDF:** `char_wb` 3–5 grams, `min_df=3`, `sublinear_tf=True` (30,282 features).
- **Classification:** 4 classes (`positive`, `negative`, `neutral`, `mixed`).
- **Training Data:** 8,000 processed service feedback records from `data/processed/sentiment_dataset.csv` (80/20 stratified split: 6,400 train / 1,600 test).
- **Production Artifacts:**
  - `ml/models/sentiment_final_model.pkl` (gitignored)
  - `ml/models/sentiment_final_vectorizer.pkl` (gitignored)
  - `ml/models/final_model_metadata.json`
  - `ml/models/final_challenge_evaluation.json`
- **Evaluation Performance (Phase 6.6):**
  - Standard Holdout (1,600 samples): **90.87%** accuracy, **0.9032** macro F1, **0.9086** weighted F1.
  - Strict Unseen-Text (1,581 samples): **90.32%** accuracy, **0.9015** macro F1, **0.9033** weighted F1.
  - Frozen Adversarial Challenge Set (90 diagnostic samples): **73.33%** accuracy (66/90), **0.7293** macro F1.

---

## Current Dataset Location

### Raw Datasets (`data/raw/`)
10 service CSV files organized by service domain (800 records each = 8,000 total):

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

Each has the canonical 12 columns: `id`, `text`, `language`, `service`, `behavior`, `sentiment`, `aspect`, `issue`, `severity`, `abuse`, `complexity`, `suggestion`.

### Processed Data (`data/processed/`)
Canonical 8,000-record dataset at `data/processed/sentiment_dataset.csv` generated from the 10 raw datasets via `ml/preprocessing/clean_datasets.py` with 0 missing values, 0 duplicate IDs, and complete normalization logged in `cleaning_log.json`.

### Challenge Test Data (`data/test/`)
Frozen 90-record adversarial challenge dataset at `data/test/challenge_dataset.csv` targeting subtle linguistic edge cases.

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
3. ✅ Django API endpoint at `POST /api/predict/` exists and loads final 8k model from `ml/models/`.
4. ✅ ML model prediction works for all 4 classes (`positive`, `negative`, `neutral`, `mixed`).
5. ✅ Frontend correctly displays custom cards for all four classes (positive=emerald, negative=rose, neutral=slate, mixed=amber).
6. ✅ Error handling works (empty input, whitespace-only input, missing text field, API errors).
7. ✅ UI has loading states, example text, character count, reset action, and keyboard shortcuts.
8. ✅ The 10 raw service datasets are organized and intact (800 records each = 8,000 total).
9. ✅ ML scripts have correct paths to `data/processed/` and `ml/models/`.
10. ✅ Root `.gitignore` prevents tracking of `venv/`, `__pycache__/`, `db.sqlite3`, `.pkl`.
11. ✅ Python dependencies documented in `requirements.txt`.
12. ✅ Reusable dataset validator (`ml/preprocessing/validate_datasets.py`) verifies all 10 raw datasets; findings documented in `docs/DATASET_VALIDATION.md`.
13. ✅ Cleaned and validated 8,000-record training dataset created at `data/processed/sentiment_dataset.csv` via `ml/preprocessing/clean_datasets.py`; findings documented in `docs/DATASET_CLEANING.md`.
14. ✅ Multi-class baseline model trained (`ml/training/train_baseline.py`) and evaluated (`ml/evaluation/evaluate_baseline.py`) achieving 93.00% accuracy and 0.9343 macro F1; documented in `docs/ML_BASELINE_EVALUATION.md`.
15. ✅ Model improvement experiments conducted (`ml/training/train_experiments.py`, `ml/evaluation/evaluate_experiments.py`); Exp 3 (Combined Word + Character n-grams) selected as winning architecture; documented in `docs/ML_IMPROVEMENT_EVALUATION.md`.
16. ✅ Challenge dataset stress-test completed (`data/test/challenge_dataset.csv`, `ml/evaluation/evaluate_challenge.py`); 90 manually curated adversarial examples exposed specific blind spots; documented in `docs/FINAL_MODEL_VALIDATION.md`.
17. ✅ Phase 6.1 Targeted dataset expansion completed: added 100 records per service (5,000 → 6,000 total).
18. ✅ Phase 6.2 Processed expanded dataset regenerated (6,000 rows, 100% valid schema).
19. ✅ Phase 6.3 Retrained Exp3 model on 6,000 records; challenge accuracy rose from 47.8% to 66.7%.
20. ✅ Phase 6.4 Targeted dataset expansion completed: added 200 records per service (6,000 → 8,000 total).
21. ✅ Phase 6.5 Processed expanded dataset regenerated (8,000 rows, 100% valid schema, 0 missing values).
22. ✅ Phase 6.6 Retrained final Exp3 model on 8,000 records; standard holdout: 90.87%, strict unseen: 90.32%, challenge accuracy surged to 73.33% (66/90 correct); documented in `docs/FINAL_MODEL_EVALUATION.md`.
23. ✅ Phase 6.7 Final model integration: Django API updated to load `sentiment_final_model.pkl` and `sentiment_final_vectorizer.pkl`.
24. ✅ Phase 7 Final Application Testing completed: Django check passed with 0 issues; 10 backend test cases passed with 100% consistency; frontend bug in `SentimentResult.jsx` fixed to support all 4 classes; frontend lint passed with 0 warnings/errors; Vite production build compiled in 1.35s; end-to-end user flow verified.
25. ✅ Phase 8 Final Documentation completed: Created comprehensive, professional root `README.md`; audited and updated all project documentation in `docs/` for accuracy and consistency; ML development is frozen and ready for Phase 9 release preparation.

---

## Known Linguistic Limitations

These represent known model characteristics identified through adversarial challenge testing:
1. **Short Text:** Terse feedback (1–3 words) lacks contextual cues and remains challenging (e.g., short ambiguous Hinglish words).
2. **Negation Nuances:** Subtle double negations or complex Hinglish negation constructs (e.g., `"koi complaint nhi hai"`) can occasionally misclassify as negative due to strong negative token weights.
3. **Polite / Indirect Complaints:** Feedback expressing complaints disguised with excessive polite gratitude can occasionally be misclassified as positive.
4. **Diagnostic Sample Sizes:** The 90-record challenge set has small sub-category sample sizes (4–13 items each) intended for qualitative diagnostics rather than broad statistical guarantees.
5. **Confidence Scores:** Model probabilities reflect classifier margin and should not be treated as a guarantee of correctness in ambiguous real-world situations.

---

## Differences Between Current State and Planned Design

| Aspect                  | Current State                              | Original Phase 0 Plan                    | Status    |
| ----------------------- | ------------------------------------------ | ---------------------------------------- | --------- |
| Sentiment classes       | 4 (positive, negative, neutral, mixed)     | 4 (positive, negative, neutral, mixed)   | Completed |
| Training data           | 8,000 service-specific records (10 CSVs)   | 5,000 service-specific records (10 CSVs) | Surpassed |
| Dataset columns         | 12 canonical columns in processed CSV      | 12 canonical columns                     | Completed |
| API response            | `{ "sentiment": "..." }` for all 4 classes | Multi-class sentiment response           | Completed |
| ML scripts              | Complete validate, clean, train, evaluate  | Full pipeline for multi-service data     | Completed |
| UI result display       | 4-class tailored card rendering with icons | Multi-class result display               | Completed |
| Processed dataset       | Canonical 8,000-record training CSV        | Cleaned, merged training CSV             | Completed |

---

## Git Status Summary

- **Branch:** `improve-sentiment-analysis` (active)
- **Status:** Implementation frozen. Application code, ML models, and datasets are validated and locked. Ready for Phase 9 (GitHub Cleanup & Release Preparation).
- **`.gitignore` rules:** `venv/`, `__pycache__/`, `*.pyc`, `db.sqlite3`, `ml/models/*.pkl`, IDE files, OS files.
-------------------- | ------------------------------------------ | ---------------------------------------- |
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
