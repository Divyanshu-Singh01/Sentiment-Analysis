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
| Model loading              | `joblib.load()` at module import time |
| Text preprocessing (API)   | `.lower()` only (minimal)             |
| Prediction                 | `vectorizer.transform` → `model.predict` |
| Response format            | `{ "sentiment": "positive" | "negative" }` |
| Django project config      | `config/` directory (settings, urls)  |

**Note:** The `sentiment` Django app is registered in `INSTALLED_APPS` but is not
actively used by the API. It contains standalone ML scripts (preprocessing, training,
evaluation) that are run manually from the command line, not through Django views.

## ML Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| Text preprocessing         | `sentiment/preprocessing.py` (lowercase, remove non-alpha, collapse whitespace) |
| Feature extraction         | TF-IDF vectorizer (`TfidfVectorizer`)  |
| Model                      | Logistic Regression (`max_iter=1000`)  |
| Training                   | `sentiment/train_model.py`             |
| Evaluation                 | `sentiment/evaluate_model.py`          |
| Data inspection            | `sentiment/data_check.py`              |
| TF-IDF inspection          | `sentiment/tfidf_test.py`              |
| Train/test split check     | `sentiment/train_test_split.py`        |
| Saved artifacts            | `.pkl` files (model + vectorizer)      |

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
analyzer/          → Django REST API views and URL routing only.
sentiment/         → ML scripts (preprocessing, training, evaluation).
                     Not exposed through Django views.
config/            → Django project configuration.
data/              → Raw and processed CSV datasets.
ml/ (or model/)    → Serialized model artifacts (.pkl files).
```
