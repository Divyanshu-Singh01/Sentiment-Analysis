# System Design

## Current Architecture

The application follows a simple three-layer architecture:

```
┌─────────────────────────────────┐
│       React Frontend            │
│  (Vite dev server, port 5173)   │
└──────────────┬──────────────────┘
               │ POST /api/predict/
               │ (proxied by Vite in dev)
┌──────────────▼──────────────────┐
│       Django REST API           │
│  (runserver, port 8000)         │
│  analyzer app → views.py        │
└──────────────┬──────────────────┘
               │ joblib.load() at startup
┌──────────────▼──────────────────┐
│       ML Model (pkl files)      │
│  LogisticRegression + TF-IDF    │
└─────────────────────────────────┘
```

## Current Data Flow

```
User types text in textarea
        ↓
React App (App.jsx)
  → calls analyzeSentiment(text)  [services/sentimentApi.js]
        ↓
fetch POST /api/predict/
  → body: { "text": "user input" }
  → Vite proxy forwards to Django (localhost:8000)
        ↓
Django analyzer/views.py
  → predict_sentiment(request)
  → text = request.data.get("text").strip()
  → cleaned_text = text.lower()
  → vectorizer.transform([cleaned_text])
  → model.predict(text_tfidf)
        ↓
Response: { "sentiment": "positive" | "negative" }
        ↓
React renders SentimentResult component
  → Green card for positive, red card for negative
```

## Frontend Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| Text input                 | `SentimentForm.jsx` with `Textarea`   |
| API communication          | `sentimentApi.js` (fetch POST)        |
| Result display             | `SentimentResult.jsx`                 |
| Error display              | `SentimentError.jsx`                  |
| Empty/initial state        | `InitialState.jsx`                    |
| Layout and header          | `App.jsx`, `Header.jsx`              |
| UI primitives              | `ui/Button.jsx`, `ui/Card.jsx`, `ui/Textarea.jsx` |
| Styling                    | Tailwind CSS 4 + `cn()` utility       |
| Dev proxy to backend       | `vite.config.js` → `/api` → `localhost:8000` |

## Backend Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| API endpoint               | `analyzer/urls.py` → `POST /api/predict/` |
| Request handling           | `analyzer/views.py` → `predict_sentiment` |
| Model loading              | `joblib.load()` from `ml/models/` at startup |
| Text preprocessing (API)   | `.lower()` only (minimal)             |
| Prediction                 | `vectorizer.transform` → `model.predict` |
| Response format            | `{ "sentiment": "positive" | "negative" }` |
| Django project config      | `config/` directory (settings, urls)  |

**Note:** In Phase 1, ML code was completely separated from the Django backend.
The empty `sentiment` Django app was removed from `INSTALLED_APPS` and its ML scripts
were moved into the dedicated `ml/` workspace.

## ML Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| Text preprocessing         | `ml/preprocessing/preprocessing.py` (clean text) |
| Feature extraction         | TF-IDF vectorizer (`TfidfVectorizer`)  |
| Model                      | Logistic Regression (`max_iter=1000`)  |
| Training                   | `ml/training/train_model.py`           |
| Evaluation                 | `ml/evaluation/evaluate_model.py`      |
| Data inspection            | `ml/preprocessing/data_check.py`       |
| TF-IDF inspection          | `ml/training/tfidf_test.py`            |
| Train/test split check     | `ml/training/train_test_split.py`      |
| Saved artifacts            | `ml/models/` (`.pkl` files)            |

## Planned Architecture (Future)

The intended future architecture adds richer analysis:

```
React Frontend
  → Richer result display (aspect, severity, suggestions, etc.)
        ↓
Django REST API
  → Enhanced prediction endpoint
  → Possibly multiple endpoints
        ↓
Improved ML Prediction Layer
  → Multi-class sentiment
  → Additional classification fields
        ↓
Processed Dataset (5,000 records, 10 services)
  → 12-column structure with rich annotations
```

## Separation of Responsibilities

```
frontend/          → All React/UI code. No ML or Python.
analyzer/          → Django REST API views and URL routing only (loads model from ml/models/).
config/            → Django project configuration (settings, urls).
ml/                → Machine learning workspace:
                     ├── models/        → Serialized model artifacts (.pkl files)
                     ├── preprocessing/ → Data inspection and cleaning
                     ├── training/      → Model training and TF-IDF scripts
                     └── evaluation/    → Evaluation metrics and reporting
data/              → Data storage by pipeline stage:
                     ├── raw/           → 10 service datasets in dedicated folders
                     └── processed/     → Cleaned, combined training datasets
docs/              → Architecture, planning, and design documentation.
```

