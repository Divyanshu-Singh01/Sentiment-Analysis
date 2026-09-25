# Simple Sentiment Analysis

A college-level sentiment analysis web application that classifies user feedback into four sentiment classes (**Positive**, **Negative**, **Neutral**, and **Mixed**) using classical machine learning, a Django REST Framework backend, and a modern React frontend.

---

## 1. Project Overview

Customer reviews and feedback often go beyond simple positive or negative remarks. Users frequently submit factual inquiries, polite complaints, mixed reviews ("good product but late delivery"), or write in Roman Hindi (Hinglish).

This project demonstrates an end-to-end machine learning engineering workflow designed for educational demonstration and academic evaluation:
- Ingests and cleans 8,000 multi-domain service feedback records across 10 industry sectors.
- Extracts sub-word and word-level patterns using combined Word and Character TF-IDF n-grams.
- Trains and optimizes an interpretable multi-class Logistic Regression classifier.
- Exposes inference through a lightweight Django REST Framework API.
- Delivers real-time predictions via an interactive React single-page application.

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
                           │ 37,640 Sparse Features
┌──────────────────────────▼─────────────────────────────┐
│             Final Sentiment Model (8k)                │
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
Canonical Processed Dataset (`data/processed/sentiment_dataset.csv`)
                        ↓
Train / Test Split (80/20 Stratified: 6,400 train / 1,600 test)
                        ↓
Feature Extraction (`sklearn.pipeline.FeatureUnion`):
  ├── Word TF-IDF: analyzer='word', ngram_range=(1,1), min_df=2, sublinear_tf=True
  └── Char TF-IDF: analyzer='char_wb', ngram_range=(3,5), min_df=3, sublinear_tf=True
                        ↓
Classifier: Logistic Regression (max_iter=1000, class_weight=None, random_state=42)
                        ↓
Evaluation & Diagnostics (Holdout, Strict Unseen-Text, Frozen Challenge Set)
                        ↓
Serialized Artifacts (`ml/models/sentiment_final_model.pkl`, `sentiment_final_vectorizer.pkl`)
```

---

## 6. Dataset

The final training dataset ([`data/processed/sentiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/processed/sentiment_dataset.csv)) contains **8,000 records** generated from 10 distinct consumer service domains.

### Service Domain Distribution
Each domain contains exactly 800 records (10.0% of the dataset):
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

### Class & Language Distribution
The dataset is naturally weighted rather than artificially forced into equal class splits, reflecting real-world customer service communication:

- **Sentiment:**
  - Negative: 3,275 records (40.9%)
  - Positive: 1,761 records (22.0%)
  - Neutral: 1,734 records (21.7%)
  - Mixed: 1,230 records (15.4%)
- **Language:**
  - English: 4,967 records (62.1%)
  - Hinglish (Roman Hindi): 3,033 records (37.9%)

### Canonical 12-Column Schema
`id`, `text`, `language`, `service`, `behavior`, `sentiment`, `aspect`, `issue`, `severity`, `abuse`, `complexity`, `suggestion`.

---

## 7. Model Specification

- **Algorithm:** Multi-class Logistic Regression (`sklearn.linear_model.LogisticRegression`)
- **Features:** Combined via `FeatureUnion` (37,640 total feature columns)
  - **Word TF-IDF:** Word unigrams (1, 1), `min_df=2`, `sublinear_tf=True`, L2 normalization
  - **Character TF-IDF:** Character boundary n-grams (3, 5), `min_df=3`, `sublinear_tf=True`, L2 normalization
- **Hyperparameters:** `max_iter=1000`, `class_weight=None`, `random_state=42`
- **Inputs:** Raw input text only (metadata fields are not utilized during inference).

---

## 8. Evaluation Results

Performance was evaluated across three distinct evaluation protocols. These metrics represent experimental evaluation results and should not be interpreted as universal real-world accuracy guarantees:

### A. Standard 80/20 Stratified Holdout (1,600 samples)
- **Accuracy:** **90.87%** (1,454 / 1,600)
- **Macro F1:** **0.9032**
- **Weighted F1:** **0.9086**
- **Per-Class F1:** Negative: 0.9156 | Positive: 0.9167 | Neutral: 0.9244 | Mixed: 0.8559
- **Language Slices:** English: 91.35% | Hinglish: 89.98%

### B. Strict Unseen-Text Holdout (1,581 samples)
Evaluated with zero identical text phrases permitted between training and test splits:
- **Accuracy:** **90.32%** (1,428 / 1,581)
- **Macro F1:** **0.9015**
- **Weighted F1:** **0.9033**

### C. Frozen Adversarial Challenge Set (90 diagnostic samples)
A manually curated adversarial dataset targeting subtle linguistic failure modes:
- **Accuracy:** **73.33%** (66 / 90 correct; up from 47.78% in initial baseline)
- **Macro F1:** **0.7293**
- **Weighted F1:** **0.7341**
- **Key Diagnostic Slices:**
  - Sarcasm: 100.0% (4/4)
  - Factual / Neutral: 100.0% (7/7)
  - Transliteration Variations: 100.0% (8/8)
  - Ordinary English: 88.9% (8/9)
  - Hinglish Challenge Text: 73.0% (27/37)
  - Short Text (length ≤ 5 words): 70.4% (19/27)
  - Mixed Clauses: 69.2% (9/13)
  - Polite Complaints: 60.0% (3/5)

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

