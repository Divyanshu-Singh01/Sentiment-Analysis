# Simple Sentiment Analysis

A college-level sentiment analysis web application that classifies user feedback into four sentiment classes (**Positive**, **Negative**, **Neutral**, and **Mixed**) using classical machine learning, a Django REST Framework backend, and a modern React frontend.

---

## 1. Project Overview

Customer reviews and feedback often go beyond simple positive or negative remarks. Users frequently submit factual inquiries, polite complaints, mixed reviews ("good product but late delivery"), or write in Roman Hindi (Hinglish).

This project demonstrates an end-to-end machine learning engineering workflow designed for educational demonstration and academic evaluation:
- Ingests and cleans 8,000 multi-domain service feedback records across 10 industry sectors.
- Augmented with 520 targeted experiment records (400 generic English + 120 Hinglish negation) to train the promoted Phase 6.9 production model on 8,520 records.
- Extracts sub-word and word-level patterns using combined Word and Character TF-IDF n-grams.
- Trains and optimizes an interpretable multi-class Logistic Regression classifier.
- Exposes inference through a lightweight Django REST Framework API.
- Delivers real-time predictions via an interactive React single-page application.

> **Runtime & Reproducibility Note:** The application runs using the serialized Phase 6.9 production model and vectorizer. Historical experiments and targeted training records are retained for reproducibility and research transparency but are not required at runtime.

---

## 2. Features

Only implemented and verified features are documented:

- **4-Class Sentiment Classification:** Categorizes input text as `Positive`, `Negative`, `Neutral`, or `Mixed`.
- **Bilingual & Transliteration Support:** Analyzes both English and Roman Hindi (Hinglish) feedback (e.g., handling spelling variations like *bohot*, *bahut*, *nhi*, *nahi*).
- **Interactive Web Interface:** Clean single-page application with immediate card-based sentiment feedback.
- **Visual Feedback Cards:** Distinct styling, badges, and icons for each sentiment class:
  - Positive (Emerald green with check icon)
  - Negative (Rose red with alert icon)
  - Neutral (Slate grey with minus icon)
  - Mixed (Amber yellow with scale icon)
- **Convenience Controls:** Live character counter, sample phrase shortcuts, and input reset.
- **RESTful Prediction API:** Standard JSON endpoint (`POST /api/predict/`) with input validation and error responses.

---

## 3. Technology Stack

### Backend & Machine Learning
- **Language:** Python 3.13
- **Web Framework:** Django 6.1
- **API Framework:** Django REST Framework 3.16
- **ML Library:** scikit-learn 1.9
- **Data Manipulation:** pandas 2.2, NumPy 2.2
- **Model Serialization:** joblib 1.4

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Linter:** oxlint

### Storage & Tooling
- **Datasets:** CSV (Canonical 12-column schema)
- **Version Control:** Git & GitHub

---

## 4. System Architecture

The application uses a decoupled client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite)                   │
│         User text input & result card render           │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/predict/
                           │ JSON: { "text": "..." }
┌──────────────────────────▼─────────────────────────────┐
│               Django REST Framework API                │
│         Request validation & error handling            │
└──────────────────────────┬─────────────────────────────┘
                           │ In-memory inference
┌──────────────────────────▼─────────────────────────────┐
│             Text Preprocessing & Vectorization         │
│     FeatureUnion: Word TF-IDF + Char n-grams TF-IDF     │
└──────────────────────────┬─────────────────────────────┘
                           │ 34,592 Sparse Features
┌──────────────────────────▼─────────────────────────────┐
│          Production Sentiment Model (Phase 6.9)        │
│       Multi-class Logistic Regression Classifier       │
└──────────────────────────┬─────────────────────────────┘
                           │ Predicted label
┌──────────────────────────▼─────────────────────────────┐
│                 JSON Response Payload                  │
│               { "sentiment": "mixed" }                 │
└────────────────────────────────────────────────────────┘
```

---

## 5. Machine Learning Pipeline

```
Raw Service Datasets (10 domains × 800 records = 8,000 raw rows)
                        ↓
Data Validation (`ml/preprocessing/validate_datasets.py`)
                        ↓
Deterministic Cleaning Pipeline (`ml/preprocessing/clean_datasets.py`)
- Reconstructs 369 legacy shifted rows
- Normalizes complexity typos and service mismatches
- Resolves cross-dataset duplicate ID prefix typos
                        ↓
Canonical Foundation Dataset (`data/processed/sentiment_dataset.csv` - 8,000 records)
                        ↓
Targeted Empirical Augmentations (Phase 6.8 & 6.9):
  ├── Phase 6.8: +400 targeted generic English sentiment records
  └── Phase 6.9: +120 targeted Hinglish negation & strong negative records
                        ↓
Production Training Dataset (`data/test/phase_6_9_experiment_dataset.csv` - 8,520 records)
                        ↓
Feature Extraction (`sklearn.pipeline.FeatureUnion` - 34,592 features):
  ├── Word TF-IDF: analyzer='word', ngram_range=(1,1), min_df=2, sublinear_tf=True
  └── Char TF-IDF: analyzer='char_wb', ngram_range=(3,5), min_df=3, sublinear_tf=True
                        ↓
Classifier: Logistic Regression (max_iter=1000, class_weight=None, random_state=42)
                        ↓
Promoted Production Artifacts (`ml/models/sentiment_final_model.pkl`, `sentiment_final_vectorizer.pkl`)
```

---

## 6. Dataset

The production model is trained on **8,520 records**, built from the canonical 8,000-record multi-domain foundation plus 520 targeted diagnostic records:
1. **Canonical Foundation Dataset ([`data/processed/sentiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/processed/sentiment_dataset.csv)):** 8,000 records across 10 service domains (remains intact and unchanged).
2. **Phase 6.8 Targeted Generic Expansion ([`data/experiments/phase_6_8_targeted/targeted_records.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/experiments/phase_6_8_targeted/targeted_records.csv)):** 400 records addressing generic English praise (*"loved"*, *"amazing"*, first-person sentences).
3. **Phase 6.9 Targeted Hinglish Negation ([`data/test/phase_6_9_hinglish_negation.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/phase_6_9_hinglish_negation.csv)):** 120 records addressing Hinglish negation patterns (*"acha nahi laga"*, *"bahut bura tha"*).

### Service Domain Distribution
The base dataset contains exactly 800 records per domain (10.0% each):
- Banking & UPI
- Cab & Transport
- Customer Support
- E-Commerce
- Education & EdTech
- Food Delivery & Restaurants
- Grocery Delivery
- Healthcare & Consultations
- Telecom & Broadband
- Travel & Hospitality

### Class Distribution (8,520 Production Training Records)
- **Negative:** 3,523 records (41.3%)
- **Positive:** 1,978 records (23.2%)
- **Neutral:** 1,754 records (20.6%)
- **Mixed:** 1,265 records (14.8%)

### Canonical 12-Column Schema
`id`, `text`, `language`, `service`, `behavior`, `sentiment`, `aspect`, `issue`, `severity`, `abuse`, `complexity`, `suggestion`.

---

## 7. Model Specification

- **Current Production Model:** Phase 6.9 Promoted Final Model
- **Algorithm:** Multi-class Logistic Regression (`sklearn.linear_model.LogisticRegression`)
- **Features:** Combined via `FeatureUnion` (34,592 sparse feature columns)
  - **Word TF-IDF:** Word unigrams (1, 1), `min_df=2`, `sublinear_tf=True`, L2 normalization
  - **Character TF-IDF:** Character boundary n-grams (3, 5), `min_df=3`, `sublinear_tf=True`, L2 normalization
- **Hyperparameters:** `max_iter=1000`, `class_weight=None`, `random_state=42`
- **Inputs:** Raw input text only (metadata fields are not utilized during inference).

---

## 8. Evaluation Results

Performance was evaluated across multiple rigorous evaluation protocols. These metrics represent experimental evaluation results and should not be interpreted as universal real-world accuracy guarantees:

### A. Standard 80/20 Stratified Holdout (1,704 samples)
- **Accuracy:** **91.43%** (1,558 / 1,704)
- **Macro F1:** **0.9090**
- **Weighted F1:** **0.9140**
- **Per-Class F1:** Negative: 0.9204 | Positive: 0.9229 | Neutral: 0.9242 | Mixed: 0.8683

### B. Strict Unseen-Text Holdout (Group-partitioned)
Evaluated with zero identical text phrases permitted between training and test splits:
- **Accuracy:** **90.48%**
- **Macro F1:** **0.9022**

### C. Frozen Adversarial Challenge Set (90 diagnostic samples)
A manually curated adversarial benchmark ([`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv)) targeting subtle linguistic failure modes:
- **Accuracy:** **75.56%** (68 / 90 correct; up from 47.78% in initial baseline, 73.33% in Phase 6.6)
- **Macro F1:** **0.7553** (up from 0.4316 in initial baseline, 0.7293 in Phase 6.6)
- **Total Challenge Errors:** **22** (down from 47 in baseline, 24 in Phase 6.6)
- **Key Diagnostic Slices:**
  - Sarcasm: 100.0% (4/4)
  - Factual / Neutral: 100.0% (7/7)
  - Hinglish Challenge Text: 73.0% (27/37)
  - Short Text: 68.8% (11/16)
  - Ordinary English: 88.9% (8/9)
  - Mixed Clauses: 69.2% (9/13)

### D. Controlled Diagnostic Suite (10 cases)
- **Accuracy:** **100.0% (10/10)**
- `"I absolutely loved this product."` → predicted **`positive`** (89.5% confidence; resolved from historical negative failure).
- `"bahut bura tha ye sab"` and `"acha nhi laga mujhe"` → predicted **`negative`** (Hinglish negation resolved).

---

## 9. REST API Reference

### Predict Sentiment Endpoint
`POST /api/predict/`

#### Request Payload
```json
{
  "text": "Food was tasty but delivery was late"
}
```

#### Successful Response (HTTP 200 OK)
```json
{
  "sentiment": "mixed"
}
```

#### Error Handling (HTTP 400 Bad Request)
Returned when input text is missing, empty, or whitespace-only:
```json
{
  "error": "Please enter some text to analyze."
}
```

---

## 10. Frontend User Interface

The React single-page application displays tailored feedback cards based on the API response:

| Sentiment | Accent Color | Visual Icon | Description Provided |
| :--- | :--- | :---: | :--- |
| **Positive** | Emerald | `Check` | *"Your text has a positive sentiment."* |
| **Negative** | Rose | `AlertCircle` | *"Your text has a negative sentiment."* |
| **Neutral** | Slate | `Minus` | *"Your text has a neutral or factual tone."* |
| **Mixed** | Amber | `Scale` | *"Your text contains both positive and negative aspects."* |

---

## 11. Application Testing & Verification

The integrated application underwent a thorough testing suite in Phase 7:
- **Django System Check:** `python manage.py check` completed with 0 issues.
- **API Tests:** 10 diverse test cases passed with 100% consistency against direct model inference.
- **Frontend Code Quality:** `npx oxlint` passed with 0 warnings and 0 errors across 13 files.
- **Production Build:** Vite production bundle compiled in 1.35s with zero syntax or bundling errors.
- **Dataset Immutability:** Checked that raw (8,000), processed (8,000), and test (90) records are 100% preserved.

---

## 12. Known Limitations & Failure Modes

In the spirit of honest academic engineering, several linguistic limitations exist:

1. **Ultra-Short Statements:** 1–3 word phrases (e.g., *"okay product"*) lack syntactic context and can be ambiguous for n-gram frequency models.
2. **Negation with Strong Tokens:** Phrases like `"koi complaint nhi hai"` ("there is no complaint") can still be misclassified as negative because the strong unigram *"complaint"* dominates the linear score.
3. **Subtle & Polite Complaints:** While improved from 20% to 60%, negative feedback disguised in polite phrases (*"With all due respect, the app is failing"*) can still trigger positive n-gram weights.
4. **Diagnostic Challenge Sample Sizes:** Categories in the frozen challenge dataset contain 4 to 27 records each; while useful as stress tests, they have wide confidence intervals.
5. **Linear Model Trade-offs:** The model uses linear bag-of-words and character n-grams. It does not use deep transformer attention or semantic contextual embeddings.
6. **Confidence Values:** Raw softmax output probabilities indicate model margin, not guaranteed real-world correctness.

---

## 13. Running Locally

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
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run system checks
python manage.py check

# Start the Django development server (port 8000)
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install JavaScript dependencies
npm install

# Run linter
npm run lint

# Start the Vite development server (port 5173, proxies /api to port 8000)
npm run dev
```

Open `http://localhost:5173` in your browser to interact with the application.

### 3. (Optional) Model Retraining & Evaluation

The repository includes the pre-trained final model artifacts (`ml/models/sentiment_final_model.pkl` and `sentiment_final_vectorizer.pkl`), allowing the application to run immediately upon setup.

If you wish to retrain the model or re-run the evaluation benchmarks:

```bash
# Retrain the final FeatureUnion model on the processed 8,000-record dataset
python ml/training/train_final.py

# Run holdout and frozen challenge set evaluation
python ml/evaluation/evaluate_final.py
```

