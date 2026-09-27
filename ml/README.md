# Machine Learning Pipeline Documentation

This directory contains the training pipelines, feature extractors, model artifacts, and evaluation scripts for the 4-class Sentiment Analysis model.

---

## 1. Directory Structure

```
ml/
├── models/
│   ├── sentiment_final_model.pkl         # Production Logistic Regression model
│   ├── sentiment_final_vectorizer.pkl    # Production FeatureUnion TF-IDF vectorizer
│   ├── final_model_metadata.json         # Serialized training metadata & split metrics
│   └── final_challenge_evaluation.json   # Benchmark evaluation results & category breakdown
├── training/
│   ├── train_final.py                    # Primary production retraining pipeline (Phase 7)
│   ├── train_experiments.py              # Phase 5 controlled experiments pipeline (Exp 1–4)
│   └── train_baseline.py                 # Initial single-unigram baseline trainer
├── evaluation/
│   ├── evaluate_final.py                 # Production challenge benchmark evaluation & 3-way compare
│   ├── evaluate_challenge.py             # Diagnostic error breakdown on 90 challenge samples
│   ├── evaluate_experiments.py           # Evaluation runner for Phase 5 candidates
│   └── evaluate_baseline.py              # Baseline evaluation runner
└── preprocessing/
    ├── clean_datasets.py                 # Dataset deduplication & whitespace normalization
    └── validate_datasets.py              # Schema integrity and class distribution checker
```

---

## 2. Model Architecture

The model uses a classical linear architecture optimized for speed ($< 15\text{ms}$ on CPU) and high interpretability:

```
Input Text (English / Roman Hindi / Hinglish)
                      │
                      ▼
     ┌───────────────────────────────────┐
     │   sklearn.pipeline.FeatureUnion   │
     │      (69,634 Sparse Features)     │
     └─────────────────┬─────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌────────────────────────┐  ┌────────────────────────┐
│      Word TF-IDF       │  │   Character TF-IDF     │
│ • Unigrams & Bigrams   │  │ • Boundary n-grams     │
│   ngram_range=(1, 2)   │  │   ngram_range=(3, 5)   │
│ • min_df=2             │  │ • min_df=3             │
│ • sublinear_tf=True    │  │ • sublinear_tf=True    │
│ • norm='l2'            │  │ • norm='l2'            │
└────────┬───────────────┘  └────────┬───────────────┘
         └─────────────┬─────────────┘
                       │ Concatenated feature vectors
                       ▼
    ┌──────────────────────────────────────┐
    │    Multi-class LogisticRegression    │
    │  • max_iter=1000                     │
    │  • random_state=42                   │
    │  • Softmax probability estimation    │
    └──────────────────┬───────────────────┘
                       │
                       ▼
    Predicted Class (positive / negative / neutral / mixed)
    + Confidence Probability Score & 4-Class Distribution
```

---

## 3. Why This Architecture?

1. **Word Bigrams `(1, 2)`:** Binds two-word phrases like `"very bad"`, `"not good"`, `"koi complaint"`, and `"top notch"` into individual features, eliminating the sequence blindness of unigram-only models.
2. **Character n-grams `(3, 5)`:** Captures morphological roots and accommodates informal phonetic spelling variations in Hinglish (e.g. *bohot*, *bahut*, *bht*, *achha*, *acha*).
3. **Sublinear TF Scaling (`sublinear_tf=True`):** Replaces raw term frequency $\text{tf}$ with $1 + \log(\text{tf})$, preventing repetitive words in long reviews from artificially dominating the prediction.
4. **Logistic Regression with Softmax:** Produces calibrated, explainable probabilities per class, enabling the frontend's uncertainty alert (`is_close = (top_prob - 2nd_prob) < 0.10`).

---

## 4. How to Retrain & Evaluate

### Retrain the Production Model (Phase 7)
```bash
python ml/training/train_final.py
```
* Trains on `data/processed/sentiment_dataset_production.csv` (8,573 records).
* Runs Standard Stratified 80/20 Holdout and Strict Unseen-Text Holdout evaluations.
* Serializes updated model, vectorizer, and metadata to `ml/models/`.

### Run Challenge Benchmark Evaluation
```bash
python ml/evaluation/evaluate_challenge.py
```
* Tests the model against the 90 frozen adversarial edge cases in `data/test/challenge_dataset.csv`.
* Prints per-class precision/recall/F1, slice accuracy, and category breakdowns.

### Run Full 3-Way Comparative Evaluation
```bash
python ml/evaluation/evaluate_final.py
```
* Compares Phase 5 (5k dataset) vs. Phase 6.3 (6k dataset) vs. Phase 7 (8.5k dataset).

---

## 5. Official Benchmark Results

| Evaluation Metric | Standard Holdout | Strict Unseen-Text | Frozen Challenge Benchmark |
| :--- | :---: | :---: | :---: |
| **Accuracy** | **91.84%** | **90.79%** | **93.33%** |
| **Macro F1** | **0.9150** | **0.9062** | **0.9322** |
| **Weighted F1** | **0.9182** | **0.9078** | **0.9338** |
| **Total Test Samples** | 1,715 | 1,716 | 90 |
