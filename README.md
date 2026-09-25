# Simple Sentiment Analysis

A college-level sentiment analysis web application that classifies customer feedback into four sentiment classes (**Positive**, **Negative**, **Neutral**, and **Mixed**) using classical machine learning, a Django REST Framework backend with session authentication & CSRF protection, and a modern single-page React interface.

---

## 1. Project Purpose

Customer reviews frequently go beyond simple positive or negative remarks, often containing factual queries, mixed feedback (*"great food but slow delivery"*), or Roman Hindi (Hinglish). 

This project demonstrates an end-to-end, production-grade machine learning workflow designed for academic presentation and real-world evaluation:
- Cleans and normalizes 8,000 multi-domain service feedback records across 10 industry sectors.
- Augmented with 520 targeted diagnostic records (8,520 total training records) for enhanced English and Hinglish negation handling.
- Uses word and character n-gram TF-IDF feature extraction (34,592 features).
- Trains an interpretable multi-class Logistic Regression classifier.
- Exposes predictions through a secure Django REST Framework API with session authentication, CSRF enforcement, and an anonymous 10-analysis trial quota.
- Delivers real-time predictions via an interactive React web interface featuring confidence scoring and close-prediction uncertainty alerts.

---

## 2. Key Features

- **4-Class Sentiment Prediction:** Categorizes input text as `Positive`, `Negative`, `Neutral`, or `Mixed`.
- **Model Confidence & Class Breakdown:** Returns the top winning score percentage and an expandable breakdown of probabilities across all four classes.
- **Close-Prediction Uncertainty Indicator:** Highlights predictions where the margin between the top two sentiment probabilities is less than 10% ($\Delta < 0.10$).
- **Dual-Tier Access & Quota Control:**
  - **Anonymous Visitors:** Immediate access without registration, capped at 10 free successful analyses per session.
  - **Authenticated Users:** Unlimited predictions with user signup, login, session persistence, and logout.
- **Security & Integrity:** Django session authentication, custom CSRF protection (`CsrfEnforcedSessionAuthentication`), and automated CSRF token rotation on auth events.
- **Bilingual & Transliteration Support:** Accurately classifies English as well as Roman Hindi (Hinglish) feedback (e.g. *bohot*, *bahut*, *nhi*, *nahi*).
- **Modern User Experience:** Single-page interface with a warm copper glassmorphic aesthetic, live character counter, example phrase shortcut, and subtle animations.

---

## 3. Technology Stack

### Backend & Machine Learning
- **Python:** 3.13
- **Framework:** Django 6.1.1 & Django REST Framework 3.18.1
- **Machine Learning:** scikit-learn 1.9.1
- **Data Manipulation:** pandas 2.3.3, NumPy 2.5.3
- **Serialization:** joblib 1.6.0
- **Database & Sessions:** SQLite 3 (`db.sqlite3`)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8.3.0
- **Styling:** Tailwind CSS 4 & Vanilla CSS
- **Icons:** Lucide React
- **Linter:** oxlint

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite)                   │
│         User text input, modals, result render         │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/predict/
                           │ Credentials: same-origin, X-CSRFToken
┌──────────────────────────▼─────────────────────────────┐
│               Django REST Framework API                │
│    Session auth, CSRF verification, quota check        │
└──────────────────────────┬─────────────────────────────┘
                           │ In-memory feature extraction
┌──────────────────────────▼─────────────────────────────┐
│             Text Vectorizer (FeatureUnion)             │
│    Word TF-IDF (1,1) + Char boundary n-grams (3,5)     │
└──────────────────────────┬─────────────────────────────┘
                           │ 34,592 Sparse Features
┌──────────────────────────▼─────────────────────────────┐
│          Production Model (Logistic Regression)        │
│       Multi-class probability estimation via softmax   │
└──────────────────────────┬─────────────────────────────┘
                           │ Predicted label, score, scores, is_close
┌──────────────────────────▼─────────────────────────────┐
│                 JSON Response Payload                  │
│  { "sentiment": "positive", "score": 0.85, ... }       │
└────────────────────────────────────────────────────────┘
```

---

## 5. Model & Dataset Overview

- **Dataset:** 8,000 canonical foundation records across 10 service domains (Banking, Cab, Customer Support, E-Commerce, Education, Food Delivery, Grocery, Healthcare, Telecom, Travel), augmented to 8,520 records with targeted diagnostic samples.
- **Production Artifacts:** Pre-trained and serialized in `ml/models/`:
  - `sentiment_final_model.pkl`: Multi-class Logistic Regression (`random_state=42`, `max_iter=1000`).
  - `sentiment_final_vectorizer.pkl`: Combined Word + Character n-gram TF-IDF vectorizer.
  - `final_model_metadata.json`: Verified training parameters.
- **Evaluation Performance:**
  - **Standard Stratified 80/20 Holdout:** **91.43%** accuracy, **0.9090** macro F1.
  - **Strict Unseen-Text Holdout:** **90.48%** accuracy, **0.9022** macro F1.
  - **Frozen Adversarial Challenge Set (90 samples):** **75.56%** accuracy, **0.7553** macro F1.

---

## 6. REST API Reference

| Endpoint | Method | Auth Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/csrf/` | `GET` | No | Fetches a fresh CSRF token and sets the cookie. |
| `/api/auth/me/` | `GET` | No | Checks current session status and remaining anonymous predictions. |
| `/api/auth/signup/` | `POST` | No | Registers a new account and logs in automatically. |
| `/api/auth/login/` | `POST` | No | Authenticates user with username and password. |
| `/api/auth/logout/` | `POST` | No | Logs out the user and clears authentication session. |
| `/api/predict/` | `POST` | Quota-based | Analyzes sentiment for the provided input text. |

### Prediction Example (`POST /api/predict/`)

**Request Payload:**
```json
{
  "text": "The delivery was surprisingly fast and the food was great!"
}
```

**Response Payload (HTTP 200 OK):**
```json
{
  "sentiment": "positive",
  "score": 0.753,
  "scores": {
    "positive": 0.753,
    "negative": 0.1212,
    "neutral": 0.0845,
    "mixed": 0.0414
  },
  "is_close": false,
  "free_predictions_remaining": 9
}
```

---

## 7. Setup & Running Locally

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Divyanshu-Singh01/Sentiment-Analysis.git
cd "Sentiment-Analysis"

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (creates auth and session tables)
python manage.py migrate

# Run system checks and test suite
python manage.py check
python manage.py test analyzer

# Start the Django development server (port 8000)
python manage.py runserver
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run linter
npm run lint

# Start the Vite development server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## 8. Current Project Status

- **System Health:** Fully operational with all 15 Django unit tests and 17 end-to-end integration scenarios passing.
- **Frontend Quality:** Zero linter errors across all components; production bundle builds in under 1 second.
- **Detailed Documentation:**
  - For full architectural and implementation details, see [CURRENT_STATE.md](CURRENT_STATE.md).
  - For potential roadmap features, see [FUTURE_IMPROVEMENTS.md](FUTURE_IMPROVEMENTS.md).
