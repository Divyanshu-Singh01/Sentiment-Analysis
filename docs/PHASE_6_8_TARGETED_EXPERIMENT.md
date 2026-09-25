# Phase 6.8 — Targeted Generic Sentiment Expansion & Candidate Model Experiment Report

> **Document Type:** Machine Learning Experiment & Candidate Validation Report  
> **Experiment Tag:** Phase 6.8 Controlled Targeted Data Experiment  
> **Date:** September 2026  
> **Status:** Experiment Complete (Production Frozen & Untouched)  
> **Evaluation Artifacts:** [`ml/models/experiments/phase_6_8/`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/)  
> **Experimental Dataset:** [`data/experiments/phase_6_8_targeted/experiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/experiments/phase_6_8_targeted/experiment_dataset.csv)  

---

## 1. Objective

The objective of Phase 6.8 is to run **one strictly controlled targeted-data experiment** to test whether adding 400 carefully engineered generic sentiment records cures a specific real-world failure discovered in the production sentiment model:

$$\text{"I absolutely loved this product."} \longrightarrow \text{Predicted as } \mathbf{negative} \text{ by Production Model}$$

### Strict Safety & Isolation Rules
1. **Production Assets Unmodified:**
   - Production model: [`ml/models/sentiment_final_model.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/sentiment_final_model.pkl) (SHA-256: `aa4f9108f1a41a93c5155c8b9f56e4451a4a916bc4a302dab287b08197edd7f9`) remained 100% untouched.
   - Production vectorizer: [`ml/models/sentiment_final_vectorizer.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/sentiment_final_vectorizer.pkl) (SHA-256: `bf46c80b44314bc1ca12cd3260b096e1491337a31c5df18119491cc61482efda`) remained 100% untouched.
   - Production 8,000-record dataset: [`data/processed/sentiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/processed/sentiment_dataset.csv) (SHA-256: `6a3e8fae159cfd59cf40d3651496b69a7bb99d2a0b7889f1c4abd8ab60931cbd`) remained 100% untouched.
   - Challenge benchmark dataset: [`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv) (SHA-256: `f3fce1b52de394f1dc2c12ab4a5941a3cd841a780d9fa911d6a527039db4a592`) remained 100% untouched.
2. **Zero Code Changes:** No modifications were made to the Django API, frontend React components, or production inference endpoints.
3. **Candidate Model Saved Independently:** All candidate training and evaluation artifacts are stored exclusively in [`ml/models/experiments/phase_6_8/`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/).
4. **No Git Commit:** The git workspace remains clean and uncommitted.

---

## 2. Why This Experiment Was Created (Root Cause Summary)

A detailed read-only diagnostic investigation ([`docs/LIVE_MODEL_DIAGNOSTIC_LOVED.md`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/docs/LIVE_MODEL_DIAGNOSTIC_LOVED.md)) established that the active 8k production model predicted negative due to five compounding factors:

1. **Sarcasm Frequency Imbalance:** In the 8,000-record training dataset, the token `loved` appeared 31 times. However, **20 of those 31 occurrences (64.5%) were in sarcastic negative complaints** (*"loved waiting 2 hours"*, *"loved being charged twice"*), while genuine praise accounted for only 11 occurrences (35.5%). Consequently, `word__loved` learned an unusually high positive coefficient towards the `negative` class ($+0.5868$) alongside positive ($+0.7700$).
2. **First-Person Character N-Gram Penalty:** The character n-gram `char__ i ` (leading pronoun *"I "*) carries a heavy negative weight ($+1.0957$) and a negative positive weight ($-0.5980$) because first-person constructions in customer support and complaints are predominantly grievances (*"I was charged"*, *"I waited"*, *"I am unhappy"*).
3. **Class Prior / Intercept Skew:** Negative sentiment represents 40.9% of the dataset, yielding an intercept of $+0.6233$ for Negative vs $+0.1103$ for Positive (a $+0.5130$ handicap for positive predictions).
4. **Thin Positive Decision Margin:** When classifying `"I absolutely loved this product."`, the production model scored:
   - Negative: **43.17%**
   - Positive: **41.58%**
   - Margin: **1.59%** (a mere 0.0375 raw logit differential).
   - Removing the leading `"I "` (*"Absolutely loved this product."*) flipped the prediction to **positive** (44.50%).
5. **Generic Sentiment Underrepresentation:** Customer domain data focused heavily on domain specifics (delivery, refund, ride, doctor, food) and lacked sufficient simple, generic, first-person declarative statements of praise.

---

## 3. Targeted Dataset Design

We generated exactly **400 new targeted records** saved in [`data/experiments/phase_6_8_targeted/targeted_records.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/experiments/phase_6_8_targeted/targeted_records.csv), following the strict canonical 12-column schema:
`id,text,language,service,behavior,sentiment,aspect,issue,severity,abuse,complexity,suggestion`

Experiment IDs are cleanly partitioned: `P68-001` through `P68-400`.

### A. Service Distribution (Exactly 40 Records Per Domain)
The 400 records are uniformly distributed across all 10 domain services:
- `banking_upi`: 40 records
- `cab_transport`: 40 records
- `customer_support`: 40 records
- `ecommerce`: 40 records
- `education`: 40 records
- `food_delivery`: 40 records
- `grocery_delivery`: 40 records
- `healthcare`: 40 records
- `telecom_internet`: 40 records
- `travel`: 40 records

### B. Category Distribution (400 Records Total)
| Code | Target Category | Target Count | Actual Count | Key Linguistic Focus |
| :---: | :--- | :---: | :---: | :--- |
| **A** | Genuine generic positive sentiment | 80 | 80 | *love, loved, loved this, absolutely loved, really loved, amazing, excellent* |
| **B** | Genuine generic negative sentiment | 60 | 60 | *hate, hated, horrible, terrible, awful, disappointing, frustrating* |
| **C** | First-person positive sentences | 50 | 50 | Directly counteracting the `"I "` penalty (*"I loved...", "I really enjoyed..."*) |
| **D** | Short positive English (1–6 words) | 40 | 40 | *Absolutely loved it, Really amazing, Loved it, Very impressive* |
| **E** | Short negative English (1–6 words) | 30 | 30 | *Absolutely terrible, Hated it, Really disappointing, Awful experience* |
| **F** | Genuine sarcastic negative `love/loved` | 40 | 40 | Preserving sarcasm discrimination (*"Loved waiting two hours...", "Loved being charged twice"*) |
| **G** | Negation / contrast around positive words | 30 | 30 | *didn't love, don't think this was amazing, not exactly great* |
| **H** | Generic positive vs negative paired pairs | 30 | 30 | Symmetrical positive/negative structures |
| **I** | Generic neutral / factual statements | 20 | 20 | Preventing false positives on factual text (*"Package arrived at 4 PM"*) |
| **J** | Generic mixed sentiment | 20 | 20 | Contrasting clauses (*"loved the product but hated the delivery"*) |
| **Total** | | **400** | **400** | |

### C. Language Distribution
- **English:** 290 records (72.5%)
- **Hinglish:** 110 records (27.5%) — natural Roman Hindi (*"bhai service mast thi"*, *"mujhe ye product bahut pasand aaya"*, *"maine service ko kaafi enjoy kiya"*).

### D. Class Distribution Shift
| Class | 8,000 Production Records | 400 Targeted Records | 8,400 Experiment Dataset |
| :--- | :---: | :---: | :---: |
| `negative` | 3,275 (40.94%) | 170 (42.50%) | 3,445 (41.01%) |
| `positive` | 1,761 (22.01%) | 190 (47.50%) | 1,951 (23.23%) |
| `neutral` | 1,734 (21.68%) | 20 (5.00%) | 1,754 (20.88%) |
| `mixed` | 1,230 (15.38%) | 20 (5.00%) | 1,250 (14.88%) |
| **Total** | **8,000 (100.0%)** | **400 (100.0%)** | **8,400 (100.0%)** |

> The 400 targeted records slightly bolstered the underrepresented positive class (+1.22% overall shift) without distorting the natural distribution of customer service complaints.

---

## 4. Dataset Validation

Automated validation verified strict data hygiene before training:
- **Record count:** Exactly 400 records.
- **Column count:** Exactly 12 canonical columns.
- **Missing values:** 0 nulls across all fields.
- **Label validity:** All sentiment, language, behavior, severity, and abuse labels match the canonical schema.
- **Identifier uniqueness:** 0 duplicate experiment IDs (`P68-001` to `P68-400`).
- **Internal duplicates:** 0 duplicate texts inside the 400 targeted records.
- **Overlap with 8k production dataset:** 0 exact text overlaps.
- **Overlap with 90-case challenge dataset:** 0 exact text overlaps.
- **Full experiment dataset assembled:** [`data/experiments/phase_6_8_targeted/experiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/experiments/phase_6_8_targeted/experiment_dataset.csv) (8,400 rows).

---

## 5. Training Configuration

To ensure strict comparability, the candidate model replicates the exact Phase 5 / Phase 6.6 **Exp3 pipeline**:

1. **Word TF-IDF Vectorizer:**
   - `analyzer='word'`
   - `ngram_range=(1, 1)`
   - `min_df=2`
   - `sublinear_tf=True`
2. **Character TF-IDF Vectorizer:**
   - `analyzer='char_wb'`
   - `ngram_range=(3, 5)`
   - `min_df=3`
   - `sublinear_tf=True`
3. **Feature Combination:** `sklearn.pipeline.FeatureUnion` (34,671 features extracted on 8.4k dataset).
4. **Classifier:** `LogisticRegression(max_iter=1000, class_weight=None, random_state=42)`.
5. **Stratified Split:** 80/20 train/test split on 8,400 records (6,720 train / 1,680 test, `random_state=42`, `stratify=y`).
6. **Artifacts Saved Exclusively to:**
   - Model: [`ml/models/experiments/phase_6_8/sentiment_candidate_model.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/sentiment_candidate_model.pkl)
   - Vectorizer: [`ml/models/experiments/phase_6_8/sentiment_candidate_vectorizer.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/sentiment_candidate_vectorizer.pkl)
   - Metadata: [`ml/models/experiments/phase_6_8/candidate_metadata.json`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/candidate_metadata.json)
   - Evaluation: [`ml/models/experiments/phase_6_8/candidate_evaluation.json`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/experiments/phase_6_8/candidate_evaluation.json)

---

## 6. Production Baseline vs Candidate Metrics

| Metric | Production (8k Baseline) | Candidate (8.4k Experiment) | Absolute Difference | Relative Change |
| :--- | :---: | :---: | :---: | :---: |
| **Standard Holdout Accuracy** | 90.87% | **91.01%** | +0.14% | Improved |
| **Standard Holdout Macro F1** | 0.9032 | **0.9062** | +0.0030 | Improved |
| **Standard Holdout Weighted F1** | 0.9086 | **0.9100** | +0.0014 | Improved |
| **Strict Unseen-Text Accuracy** | 90.32% | **90.99%** | +0.67% | Improved |
| **Strict Unseen-Text Macro F1** | 0.9015 | **0.9080** | +0.0065 | Improved |
| **29-Case Live Test Accuracy** | 86.21% (25/29) | **93.10% (27/29)** | **+6.89%** | Strong Gain |
| **29-Case Live Test Macro F1** | 0.8717 | **0.9348** | **+0.0631** | Strong Gain |
| **90-Case Challenge Accuracy** | 73.33% (66/90) | **73.33% (66/90)** | 0.00% | Preserved |
| **90-Case Challenge Macro F1** | 0.7293 | **0.7312** | +0.0019 | Slight Gain |
| **10-Case Controlled Diagnostic** | 20.00% (2/10) | **100.00% (10/10)** | **+80.00%** | Decisive Fix |

### Candidate Classification Report (Standard 80/20 Holdout)
```text
              precision    recall  f1-score   support

       mixed     0.9091    0.8400    0.8732       250
    negative     0.8814    0.9492    0.9140       689
     neutral     0.9544    0.8946    0.9235       351
    positive     0.9286    0.9000    0.9141       390

    accuracy                         0.9101      1680
   macro avg     0.9184    0.8959    0.9062      1680
weighted avg     0.9117    0.9101    0.9100      1680
```

---

## 7. 10-Case Controlled Diagnostic Set Comparison

This is the primary diagnostic suite that originally identified the model failure.

| Test Input | Expected | Production Prediction | Candidate Prediction | Production Pos % | Candidate Pos % | Production Neg % | Candidate Neg % | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **"I absolutely loved this product."** | `positive` | `negative` | **`positive`** | 41.58% | **91.65%** | 43.17% | 7.35% | **FIXED** |
| **"I loved this product."** | `positive` | `negative` | **`positive`** | 35.67% | **72.83%** | 45.02% | 23.82% | **FIXED** |
| **"I loved the product."** | `positive` | `negative` | **`positive`** | 36.72% | **65.16%** | 49.73% | 29.16% | **FIXED** |
| **"Absolutely loved this product."** | `positive` | `positive` | **`positive`** | 44.50% | **92.63%** | 39.87% | 6.39% | **BOOSTED** |
| **"I absolutely love this product."** | `positive` | `negative` | **`positive`** | 28.94% | **84.61%** | 38.21% | 12.44% | **FIXED** |
| **"I really loved this product."** | `positive` | `negative` | **`positive`** | 38.25% | **81.36%** | 41.69% | 16.20% | **FIXED** |
| **"This product is amazing."** | `positive` | `neutral` | **`positive`** | 10.04% | **64.98%** | 23.61% | 10.20% | **FIXED** |
| **"This is an excellent product."** | `positive` | `neutral` | **`positive`** | 16.54% | **57.47%** | 10.52% | 8.49% | **FIXED** |
| **"I hated this product."** | `negative` | `neutral` | **`negative`** | 13.31% | 8.61% | 23.84% | **81.11%** | **FIXED** |
| **"This product was horrible."** | `negative` | `negative` | **`negative`** | 8.44% | 8.13% | 39.72% | **77.49%** | **BOOSTED** |

### Summary of Diagnostic Set:
- **Did the candidate correctly classify `"I absolutely loved this product."`?**
  **YES.** It moved from `negative` (43.17% Neg / 41.58% Pos) to `positive` (**91.65% Pos** / 7.35% Neg) — a massive **+50.07% positive probability increase**.
- **Diagnostic Set Accuracy:**
  - Production: **2/10 (20.0%)**
  - Candidate: **10/10 (100.0%)** (+80.0% gain, 0 regressions).

---

## 8. 29-Case Live Test Comparison

The 29-case live evaluation represents diverse customer inputs spanning 15 functional categories.

- **Production Accuracy:** 25/29 (86.21%) | Macro F1: 0.8717
- **Candidate Accuracy:** **27/29 (93.10%)** | **Macro F1: 0.9348**
- **Regressions:** **0**
- **Net Fixes:** **+2**

### Fixed Cases in 29-Case Suite
1. `"kya bakwaas service hai ekdum bekar"`
   - Expected: `negative`
   - Production: `neutral` (42.5% neutral, 42.5% negative tie)
   - Candidate: **`negative`** (76.8% negative) $\rightarrow$ **FIXED**
2. `"horrible experience"`
   - Expected: `negative`
   - Production: `positive` (56.5% positive, 33.5% negative — severe failure on short English negative)
   - Candidate: **`negative`** (84.1% negative) $\rightarrow$ **FIXED**

### Unchanged Failures in 29-Case Suite (2 Cases)
1. `"bhai room acha tha par washroom me paani nahi aa raha tha"`: Predicted `negative` (expected `mixed`).
2. `"koi complaint nhi hai sab sahi hai"`: Predicted `negative` (expected `positive`, due to Hinglish negation complexity).

---

## 9. 90-Case Challenge Dataset Evaluation

The frozen 90-record adversarial challenge benchmark ([`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv)) tests robustness against difficult edge cases.

### Overall Metrics
- **Production Accuracy:** 73.33% (66/90) | Macro F1: 0.7293 | Total Errors: 24
- **Candidate Accuracy:** 73.33% (66/90) | Macro F1: 0.7312 | Total Errors: 24

### Category Slice Breakdown Comparison
| Challenge Category Slice | Sample Count | Production Accuracy | Candidate Accuracy | Net Difference | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Sarcasm** | 4 | **4/4 (100.0%)** | **4/4 (100.0%)** | **+0.0%** | Sarcastic negative detection fully preserved |
| **Factual / Neutral** | 7 | **7/7 (100.0%)** | **7/7 (100.0%)** | **+0.0%** | Neutral statements remain uncorrupted |
| **Ordinary English** | 9 | **8/9 (88.9%)** | **8/9 (88.9%)** | **+0.0%** | Consistent English understanding |
| **Short Tagged Expressions** | 16 | 9/16 (56.2%) | **11/16 (68.8%)** | **+12.5%** | **Strong improvement on short text** |
| **Short ($\le$ 5 words)** | 27 | 19/27 (70.4%) | 19/27 (70.4%) | +0.0% | Stable |
| **Polite Complaints** | 5 | 3/5 (60.0%) | 3/5 (60.0%) | +0.0% | Maintained |
| **Indirect Complaints** | 4 | 3/4 (75.0%) | 3/4 (75.0%) | +0.0% | Maintained |
| **Mixed Sentiment** | 13 | 9/13 (69.2%) | 9/13 (69.2%) | +0.0% | Maintained |
| **Bhai Particle** | 11 | 9/11 (81.8%) | 9/11 (81.8%) | +0.0% | Maintained |
| **Typos / Misspellings** | 4 | 3/4 (75.0%) | 3/4 (75.0%) | +0.0% | Maintained |
| **Ambiguous** | 5 | 1/5 (20.0%) | 1/5 (20.0%) | +0.0% | Maintained |
| **Transliteration Variations** | 8 | 8/8 (100.0%) | 6/8 (75.0%) | -25.0% | 2 Hinglish cases regressed (see Section 13) |
| **Hinglish Overall** | 37 | 27/37 (73.0%) | 25/37 (67.6%) | -5.4% | Affected by the 2 transliteration cases |

### Per-Class Metrics Comparison on Challenge Dataset
| Class | Production Precision | Candidate Precision | Production Recall | Candidate Recall | Production F1 | Candidate F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `positive` | 0.8000 | 0.7500 | 0.6957 | **0.7826** | 0.7442 | **0.7660** |
| `negative` | 0.7000 | **0.7222** | 0.8000 | 0.7429 | 0.7467 | 0.7324 |
| `neutral` | 0.9091 | 0.9091 | 0.6250 | 0.6250 | 0.7407 | 0.7407 |
| `mixed` | 0.6316 | 0.6316 | 0.7500 | 0.7500 | 0.6857 | 0.6857 |

> **Key Finding on Challenge Set:** Positive class recall surged from **69.57% $\rightarrow$ 78.26%** (+8.69% absolute increase), and positive F1 score climbed from **0.7442 $\rightarrow$ 0.7660**.

---

## 10. Feature Coefficient Comparison: `word__loved`

The feature weights directly explain the model's transformation:

| Class | Production Weight | Candidate Weight | Weight Change | Analysis |
| :--- | :---: | :---: | :---: | :--- |
| **`positive`** | $+0.7700$ | **$+1.4926$** | **$+0.7226$** | **Weight nearly doubled towards Positive!** |
| **`negative`** | $+0.5868$ | **$+0.4488$** | **$-0.1380$** | Negative association dampened |
| **`neutral`** | $-0.6322$ | $-1.0121$ | $-0.3799$ | Strongly inhibited |
| **`mixed`** | $-0.7246$ | $-0.9293$ | $-0.2047$ | Strongly inhibited |

In production, the positive-to-negative weight gap on `loved` was a tiny $+0.1832$ ($+0.7700$ vs $+0.5868$). In the candidate model, that gap expanded to **$+1.0438$** ($+1.4926$ vs $+0.4488$) — a **5.7x wider separation**, ensuring genuine praise easily dominates class priors.

---

## 11. Feature Coefficient Comparison: `char__ i ` and Intercepts

### Pronoun Feature `char__ i `
| Class | Production Weight | Candidate Weight | Weight Change | Analysis |
| :--- | :---: | :---: | :---: | :--- |
| **`positive`** | $-0.5980$ | **$-0.4135$** | **$+0.1845$** | Negative penalty on first-person praise significantly reduced |
| **`negative`** | $+1.0957$ | $+1.2085$ | $+0.1128$ | Complaint sensitivity preserved |
| **`neutral`** | $-0.0936$ | $-0.3506$ | $-0.2571$ | Neutral penalty increased |
| **`mixed`** | $-0.4041$ | $-0.4444$ | $-0.0402$ | Unchanged |

### Model Intercepts (Learned Class Priors)
| Class | Production Intercept | Candidate Intercept | Intercept Change |
| :--- | :---: | :---: | :---: |
| **`positive`** | $+0.1103$ | **$+0.1929$** | **$+0.0826$** |
| **`negative`** | $+0.6233$ | $+0.6407$ | $+0.0174$ |
| **`neutral`** | $+0.3555$ | $+0.2929$ | $-0.0625$ |
| **`mixed`** | $-1.0891$ | $-1.1265$ | $-0.0375$ |

The positive intercept increased from $+0.1103$ to $+0.1929$, raising the baseline floor for positive sentences without distorting the overall hierarchy.

---

## 12. Fixed Cases Summary

| Evaluation Suite | Input Text | Expected Label | Production Prediction | Candidate Prediction | Improvement Note |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Diagnostic (Target)** | `"I absolutely loved this product."` | `positive` | `negative` | **`positive`** | Pos prob jumped from 41.6% to 91.7% |
| **Diagnostic** | `"I loved this product."` | `positive` | `negative` | **`positive`** | Pos prob jumped from 35.7% to 72.8% |
| **Diagnostic** | `"I loved the product."` | `positive` | `negative` | **`positive`** | Pos prob jumped from 36.7% to 65.2% |
| **Diagnostic** | `"I absolutely love this product."` | `positive` | `negative` | **`positive`** | Pos prob jumped from 28.9% to 84.6% |
| **Diagnostic** | `"I really loved this product."` | `positive` | `negative` | **`positive`** | Pos prob jumped from 38.3% to 81.4% |
| **Diagnostic** | `"This product is amazing."` | `positive` | `neutral` | **`positive`** | Pos prob jumped from 10.0% to 65.0% |
| **Diagnostic** | `"This is an excellent product."` | `positive` | `neutral` | **`positive`** | Pos prob jumped from 16.5% to 57.5% |
| **Diagnostic** | `"I hated this product."` | `negative` | `neutral` | **`negative`** | Neg prob jumped from 23.8% to 81.1% |
| **Live 29-Case** | `"horrible experience"` | `negative` | `positive` | **`negative`** | Fixed critical short English negative inversion |
| **Live 29-Case** | `"kya bakwaas service hai ekdum bekar"` | `negative` | `neutral` | **`negative`** | Neg prob increased from 42.5% to 76.8% |
| **Challenge 90-Case** | `"loved it"` (CH002) | `positive` | `negative` | **`positive`** | Short praise correctly classified |
| **Challenge 90-Case** | `"love"` (CH060) | `positive` | `negative` | **`positive`** | Ultra-short token correctly classified |

---

## 13. Regressed Cases Summary

Across the 29-case live suite and the 10-case diagnostic suite, there were **0 regressions**.
In the 90-case challenge dataset, exactly **2 cases** regressed:

1. `"bahut bura tha ye sab"` (CH010)
   - Expected: `negative`
   - Production: `negative` (48.0% negative, 16.0% positive)
   - Candidate: `positive` (47.3% positive, 24.8% negative)
   - **Root Cause:** In the 400 targeted records, genuine positive Hinglish sentences frequently used intensifiers like *"bahut acha"*, *"bahut badhiya"*, which elevated the unigram coefficient of `bahut` towards positive. Because the model uses unigram word TF-IDF, `bahut` overpowered `bura`.
2. `"acha nhi laga mujhe"` (CH014)
   - Expected: `negative`
   - Production: `negative` (47.0% negative, 25.2% positive)
   - Candidate: `positive` (44.4% positive, 38.1% negative)
   - **Root Cause:** The positive unigram `acha` overpowered the negation token `nhi` and pronoun `mujhe`.

---

## 14. Remaining Failures

1. **Hinglish Negation Across Distance:**
   - `"koi complaint nhi hai sab sahi hai"` remains predicted as `negative` (expected `positive`). Unigram TF-IDF struggles when negation reverses sentiment without explicit bigram/dependency bindings.
2. **Ambiguous Short Colloquial Feedback:**
   - Cases like `"thik hai chalega"` (neutral) or subtle sarcasm without exaggerated punctuation remain difficult for linear n-gram models.

---

## 15. Overall Conclusion & Decision

### Empirical Balance Sheet
- **Target Failure (`"I absolutely loved this product."`):** Decisively solved ($41.58\% \rightarrow 91.65\%$ positive).
- **Diagnostic Set (10 cases):** 100% correct (up from 20% in production).
- **Live 29-Case Suite:** Accuracy rose from **86.21% $\rightarrow$ 93.10%** (+6.89%), with **0 regressions** and 2 critical bug fixes (*"horrible experience"*).
- **Standard Holdout (8,400 samples):** Maintained top-tier performance at **91.01% accuracy** and **0.9062 macro F1**.
- **Challenge Benchmark (90 cases):** Accuracy maintained at **73.33%**, macro F1 rose to **0.7312**, positive class recall jumped from **69.57% $\rightarrow$ 78.26%**, with 2 short praise cases fixed, offset by 2 Hinglish unigram regressions.

### Official Verdict
```text
PARTIAL IMPROVEMENT
```

**Justification:**  
While the targeted generic sentiment and first-person English weaknesses were **decisively resolved** without degrading holdout accuracy or live test accuracy, the candidate introduced a subtle tradeoff on two Hinglish negation/modifier cases in the adversarial challenge set due to unigram intensifier weight shifts (`bahut`). Under the strict Phase 6.8 decision criteria, an experiment that improves the target but introduces a notable tradeoff is classified as **PARTIAL IMPROVEMENT**.

Production remains untouched and fully intact.
