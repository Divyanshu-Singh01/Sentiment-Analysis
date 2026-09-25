# System Design

## Current Architecture

The application follows a decoupled three-layer client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite)                   │
│         User text input & 4-class result card          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/predict/
                           │ JSON: { "text": "..." }
┌──────────────────────────▼─────────────────────────────┐
│               Django REST Framework API                │
│       Request validation & error response handling     │
│       analyzer app → views.py (loaded once at startup) │
└──────────────────────────┬─────────────────────────────┘
                           │ In-memory inference
┌──────────────────────────▼─────────────────────────────┐
│             Vectorization & Feature Union              │
│       ml/models/sentiment_final_vectorizer.pkl         │
│   (Word unigrams TF-IDF + Char 3-5 n-grams TF-IDF)     │
└──────────────────────────┬─────────────────────────────┘
                           │ 37,640 Sparse Feature Columns
┌──────────────────────────▼─────────────────────────────┐
│               Final ML Model Artifact                  │
│          ml/models/sentiment_final_model.pkl           │
│        (Multi-Class Logistic Regression Classifier)    │
└────────────────────────────────────────────────────────┘
```

## Current Data Flow

```
User types text in textarea (or clicks sample phrase)
        ↓
React App (App.jsx)
  → calls analyzeSentiment(text) [services/sentimentApi.js]
        ↓
HTTP POST /api/predict/
  → body: { "text": "user input" }
  → Vite dev proxy forwards request to Django (localhost:8000)
        ↓
Django analyzer/views.py
  → predict_sentiment(request)
  → Input validation:
      - Missing field, empty string, or whitespace-only
        → Returns HTTP 400 Bad Request with { "error": "Please enter some text to analyze." }
  → text = request.data.get("text").strip()
  → cleaned_text = text.lower()
  → text_features = vectorizer.transform([cleaned_text])  (FeatureUnion: 37,640 features)
  → prediction = model.predict(text_features)[0]
        ↓
HTTP 200 OK Response:
  → { "sentiment": "positive" | "negative" | "neutral" | "mixed" }
        ↓
React renders SentimentResult component:
  ├── Positive → Emerald styling + Check icon
  ├── Negative → Rose styling + AlertCircle icon
  ├── Neutral  → Slate styling + Minus icon
  └── Mixed    → Amber styling + Scale icon
```

## Frontend Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| Text input                 | `SentimentForm.jsx` with `Textarea`   |
| Quick sample phrases       | `SentimentForm.jsx` (example buttons) |
| Character count & reset    | `SentimentForm.jsx`                   |
| API communication          | `sentimentApi.js` (fetch POST)        |
| 4-Class Result display     | `SentimentResult.jsx` (Tailored cards)|
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
| Model loading              | `joblib.load()` from `ml/models/` at startup (`sentiment_final_model.pkl`, `sentiment_final_vectorizer.pkl`) |
| Input validation           | Checks missing, empty, or whitespace-only inputs (HTTP 400) |
| Text preprocessing (API)   | `.strip().lower()` (lightweight, deterministic) |
| Prediction                 | `vectorizer.transform` → `model.predict` |
| Response format            | `{ "sentiment": "positive" \| "negative" \| "neutral" \| "mixed" }` |
| Django project config      | `config/` directory (`settings.py`, `urls.py`) |

## ML Pipeline Responsibilities

| Responsibility             | Implementation                        |
| -------------------------- | ------------------------------------- |
| Dataset validation         | `ml/preprocessing/validate_datasets.py` |
| Data cleaning pipeline     | `ml/preprocessing/clean_datasets.py` (reconstructs shifted rows, fixes typos, standardizes schema) |
| Feature extraction         | `sklearn.pipeline.FeatureUnion` (Word TF-IDF + Character `char_wb` n-grams TF-IDF) |
| Classifier algorithm       | `sklearn.linear_model.LogisticRegression` (`max_iter=1000`, `class_weight=None`, `random_state=42`) |
| Final model training       | `ml/training/train_final.py` (trained on 8,000 records) |
| Final model evaluation     | `ml/evaluation/evaluate_final.py` (Holdout, Unseen-Text, and Frozen Challenge set) |
| Active serialized artifacts| `ml/models/sentiment_final_model.pkl`, `sentiment_final_vectorizer.pkl` |
| Metadata & reports         | `ml/models/final_model_metadata.json`, `final_challenge_evaluation.json` |

## Separation of Responsibilities

```
frontend/          → All React/UI code. No ML or Python code.
analyzer/          → Django REST API views and URL routing only (loads model from ml/models/).
config/            → Django project configuration (settings, urls).
ml/                → Machine learning workspace:
                     ├── models/        → Serialized model artifacts (.pkl files)
                     ├── preprocessing/ → Data validation and cleaning pipelines
                     ├── training/      → Model training and TF-IDF pipelines
                     └── evaluation/    → Evaluation metrics and report generators
data/              → Data storage by pipeline stage:
                     ├── raw/           → 10 service datasets (800 records each = 8,000 total)
                     ├── processed/     → Cleaned, canonical 8,000-record dataset (sentiment_dataset.csv)
                     └── test/          → Frozen 90-record adversarial challenge set (challenge_dataset.csv)
docs/              → Complete project architecture, evaluation, and design documentation.
```

## Realized Architecture vs Initial Plan

The original Phase 0 plan envisioned evolving from a binary toy prototype into a robust multi-class, multi-domain sentiment analysis system. This has been fully realized:

1. **4 Sentiment Classes:** Successfully supports `positive`, `negative`, `neutral`, and `mixed` across the full pipeline (data, model, API, frontend).
2. **8,000 Multi-Service Records:** Expanded from initial 5,000 to 8,000 records across 10 service sectors with English and Hinglish coverage.
3. **Sub-word Feature Engineering:** Adopted `FeatureUnion` combining word unigrams and character boundary 3–5 n-grams to gracefully handle Hinglish transliteration variants and typos without brittle rule-based hacks.
4. **Frozen Implementation:** All application code, ML models, and APIs are locked, verified, and ready for release.


