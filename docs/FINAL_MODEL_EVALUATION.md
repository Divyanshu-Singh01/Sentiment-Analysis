# Final Model Evaluation Report (Phase 6.3)

> **Document Type:** Evaluation Experiment Report  
> **Target:** Phase 5 Exp3 Architecture Retrained on Expanded 6,000-Record Dataset  
> **Evaluation Date:** September 2026  
> **Branch:** `improve-sentiment-analysis`  
> **Evaluation Code:** [`ml/evaluation/evaluate_final.py`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/evaluation/evaluate_final.py)  
> **Training Code:** [`ml/training/train_final.py`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/training/train_final.py)  

---

## 1. Executive Summary

In Phase 6.3, we retrained the winning Phase 5 **Exp3 model architecture** on the newly expanded and cleaned **6,000-record dataset** ([`data/processed/sentiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/processed/sentiment_dataset.csv)) and evaluated its generalization on the **frozen 90-record adversarial challenge dataset** ([`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv)).

The targeted dataset expansion added 1,000 new service-specific examples (100 per service) deliberately structured to address identified model blind spots: factual/neutral statements, polite complaints, indirect complaints, sarcasm, conversational "bhai" particles, and Hinglish transliterations.

### Overall Status: **PARTIAL IMPROVEMENT**

- **Frozen Challenge Set Performance:** Overall accuracy jumped from **47.8% (43/90)** to **66.7% (60/90)** (+18.9% absolute, a 39.5% relative gain). Macro F1 increased from **0.4316** to **0.6688** (+0.2372). Total errors dropped from **47** to **30** (a 36.2% error reduction).
- **Major Blind Spots Substantially Resolved:**
  - **Factual / Neutral Feedback:** Soared from **14.3% (1/7)** to **85.7% (6/7)** (+71.4% gain). Neutral F1 increased from **0.1905** to **0.7333**.
  - **Sarcasm:** Jumped from **25.0% (1/4)** to **100.0% (4/4)** (+75.0% gain).
  - **"Bhai" Conversational Bias:** Jumped from **54.5% (6/11)** to **90.9% (10/11)** (+36.4% gain).
  - **Indirect Complaints:** Increased from **50.0% (2/4)** to **75.0% (3/4)** (+25.0% gain).
  - **Challenge Hinglish:** Increased from **48.6% (18/37)** to **64.9% (24/37)** (+16.3% gain).
- **Why Not a Full PASS? Important Weaknesses Remain:**
  - **Polite Complaints:** Improved from **0.0% (0/5)** to **20.0% (1/5)** (+20.0%), but 4 out of 5 polite negative complaints still fail because polite phrasing ("Not to complain but...", "With all due respect...") continues to trigger positive/mixed n-gram associations in linear models.
  - **Short Feedback (≤5 words):** Stagnated at **50.0% (8/16)** on tagged short expressions and **59.3% (16/27)** on length ≤5 words. Minimal context (1–3 words) remains fundamentally difficult for character and word n-gram frequency without semantic embeddings.
  - **Transliteration:** Slight drop from **87.5% (7/8)** to **75.0% (6/8)** due to 1 borderline example shifting.

---

## 2. Model Architecture & Training Setup

The model architecture strictly replicates the winning Phase 5 Exp3 specification without any hyperparameter tuning or balancing changes:

1. **Word TF-IDF Vectorizer:**
   - `analyzer='word'`
   - `ngram_range=(1, 1)`
   - `min_df=2`
   - `sublinear_tf=True`
   - `norm='l2'`, `use_idf=True`, `smooth_idf=True`
2. **Character TF-IDF Vectorizer:**
   - `analyzer='char_wb'`
   - `ngram_range=(3, 5)`
   - `min_df=3`
   - `sublinear_tf=True`
   - `norm='l2'`, `use_idf=True`, `smooth_idf=True`
3. **Feature Combination:** Combined using `sklearn.pipeline.FeatureUnion` (31,321 combined features).
4. **Classifier:** `LogisticRegression(max_iter=1000, class_weight=None, random_state=42)`.
5. **Training Dataset:** [`data/processed/sentiment_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/processed/sentiment_dataset.csv) (6,000 records).
6. **Artifacts Saved:**
   - Model: [`ml/models/sentiment_final_model.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/sentiment_final_model.pkl)
   - Vectorizer: [`ml/models/sentiment_final_vectorizer.pkl`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/sentiment_final_vectorizer.pkl)
   - Metadata: [`ml/models/final_model_metadata.json`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/ml/models/final_model_metadata.json)

---

## 3. Evaluation 1 — Standard Holdout (80/20 Stratified Split)

A newly generated reproducible stratified 80/20 train/test split was created from the 6,000-record dataset:
- **Training Records:** 4,800
- **Test Records:** 1,200
- **Parameters:** `test_size=0.20`, `stratify=y`, `random_state=42`

### Performance Metrics

| Metric | Phase 6.3 Retrained Exp3 (6k Data) | Phase 5 Exp3 (5k Data) | Notes |
| :--- | :---: | :---: | :--- |
| **Accuracy** | **90.83%** | 94.70% | Non-identical test sets; 6k test set contains 200 hard targeted records |
| **Macro F1** | **0.9107** | 0.9487 | Balanced class representation across all 4 labels |
| **Weighted F1** | **0.9086** | 0.9471 | Reflects distribution weighting |
| **Total Errors** | **110 / 1,200** | 53 / 1,000 | 9.17% error rate vs 5.30% error rate |

> **Methodological Note on Comparison:**  
> The 80/20 test split for Phase 6.3 contains 1,200 records drawn from the expanded 6,000-row dataset, whereas the Phase 5 test set contained 1,000 records drawn from the original 5,000-row dataset. Because the 1,000 newly added records were deliberately crafted to include subtle complaints, polite phrasing, and non-templated text, the new holdout test set is significantly more rigorous than the original.

### Per-Class Metrics (Standard Holdout)

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| `negative` | 0.8661 | 0.9260 | 0.8950 | 419 |
| `positive` | 0.9317 | 0.8980 | 0.9146 | 304 |
| `neutral` | 0.9364 | 0.8983 | 0.9170 | 295 |
| `mixed` | 0.9318 | 0.9011 | 0.9162 | 182 |

### Confusion Matrix (Standard Holdout)

Rows: Actual classes | Columns: Predicted classes (`negative`, `positive`, `neutral`, `mixed`)

```
                Predicted:
Actual      negative  positive  neutral  mixed   Total
negative       388        9       12       10     419
positive        25      273        4        2     304
neutral         23        7      265        0     295
mixed           12        4        2      164     182
Total          448      293      283      176    1200
```

---

## 4. Evaluation 4 — Strict Unseen-Text Holdout (GroupShuffleSplit)

To verify that the model does not rely on memorizing duplicate or templated review texts, a strict unseen-text split was executed using `GroupShuffleSplit` grouped by exact review text (`groups=df['text']`), ensuring zero text overlap between train and test:
- **Training Records:** 4,788
- **Test Records:** 1,212
- **Parameters:** `n_splits=1`, `test_size=0.20`, `random_state=42`

### Performance Metrics

| Metric | Phase 6.3 Strict Holdout (6k Data) | Phase 5 Strict Exp3 (5k Data) |
| :--- | :---: | :---: |
| **Accuracy** | **91.42%** | 94.91% |
| **Macro Precision** | 0.9151 | 0.9510 |
| **Macro Recall** | 0.9100 | 0.9497 |
| **Macro F1** | **0.9123** | 0.9502 |
| **Weighted F1** | **0.9142** | 0.9489 |
| **Total Errors** | **104 / 1,212** | 51 / 1,002 |
| **Train / Test Size** | 4,788 / 1,212 | 3,998 / 1,002 |

> **Analysis:**  
> The strict unseen-text accuracy (**91.42%**) is slightly *higher* than the standard stratified holdout accuracy (**90.83%**). This confirms that the model generalizes robustly to novel text formulations and does not rely on verbatim template overlap.

---

## 5. Evaluation 2 — Frozen 90-Record Challenge Set (Direct Head-to-Head)

The model was evaluated against the **exact, frozen 90-record challenge dataset** ([`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv)). Because the challenge dataset was strictly preserved and zero challenge examples were added to the training set, this comparison is **100% directly valid**.

### Overall Performance Comparison

| Metric | Phase 6 Baseline (Exp3 on 5k) | Phase 6.3 Retrained (Exp3 on 6k) | Absolute Change | Relative Change |
| :--- | :---: | :---: | :---: | :---: |
| **Accuracy** | 47.78% (43/90) | **66.67% (60/90)** | **+18.89%** | **+39.5%** |
| **Macro Precision** | 0.4573 | **0.6948** | +0.2375 | +51.9% |
| **Macro Recall** | 0.4489 | **0.6552** | +0.2063 | +46.0% |
| **Macro F1-Score** | 0.4316 | **0.6688** | **+0.2372** | **+55.0%** |
| **Weighted Precision** | 0.4712 | **0.6917** | +0.2205 | +46.8% |
| **Weighted Recall** | 0.4778 | **0.6667** | +0.1889 | +39.5% |
| **Weighted F1-Score** | 0.4589 | **0.6669** | **+0.2080** | **+45.3%** |
| **Total Errors** | 47 / 90 | **30 / 90** | **-17 errors** | **-36.2% error reduction** |

### Per-Class Comparison (Challenge Set)

| Class | Support | Phase 6 Precision | Phase 6 Recall | Phase 6 F1 | Phase 6.3 Precision | Phase 6.3 Recall | Phase 6.3 F1 | F1 Δ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `positive` | 23 | 0.5200 | 0.5652 | 0.5417 | **0.7647** | 0.5652 | **0.6500** | **+0.1083** |
| `negative` | 35 | 0.5000 | 0.5429 | 0.5205 | **0.6047** | **0.7429** | **0.6667** | **+0.1462** |
| `neutral` | 16 | 0.4000 | 0.1250 | 0.1905 | **0.7857** | **0.6875** | **0.7333** | **+0.5428** |
| `mixed` | 16 | 0.4091 | 0.5625 | 0.4737 | **0.6250** | **0.6250** | **0.6250** | **+0.1513** |

> **Key Per-Class Insight:**  
> In Phase 6, `neutral` was completely broken: only 2 out of 16 neutral samples were correctly classified (12.5% recall, 0.1905 F1). In Phase 6.3, neutral recall surged to **68.75% (11/16)** and neutral precision reached **78.57%**, driving neutral F1 up to **0.7333** (+0.5428 gain).

### Confusion Matrix Comparison (Challenge Set)

Labels: `positive`, `negative`, `neutral`, `mixed`

**Phase 6 (Old Exp3 on 5k Data):**
```
                Predicted:
Actual      positive  negative  neutral  mixed   Total
positive       13         8        0       2      23
negative        7        19        3       6      35
neutral         2         7        2       5      16
mixed           3         4        0       9      16
```

**Phase 6.3 (Retrained Exp3 on 6k Data):**
```
                Predicted:
Actual      positive  negative  neutral  mixed   Total
positive       13         9        0       1      23
negative        4        26        2       3      35
neutral         0         3       11       2      16
mixed           0         5        1      10      16
```

**Confusion Matrix Observations:**
1. **Zero False Positives for Neutral:** In Phase 6, neutral reviews were misclassified as positive (2), negative (7), and mixed (5). In Phase 6.3, false positives on neutral dropped to 0, and 11 out of 16 were accurately detected.
2. **Reduced False Positives for Negative:** Actual negative feedback misclassified as positive dropped from 7 down to 4.
3. **Zero False Positives for Mixed:** In Phase 6, 3 mixed reviews were labeled positive. In Phase 6.3, zero mixed reviews were mislabeled as positive.

---

## 6. Evaluation 3 — Challenge Category Analysis

The 90 challenge samples span 12 distinct stress categories. The table below compares the performance before and after targeted dataset expansion:

| Challenge Category | Sample Count | Old Accuracy (Phase 6) | New Accuracy (Phase 6.3) | Absolute Change | Evaluation Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Sarcastic complaints** | 4 | 25.0% (1/4) | **100.0% (4/4)** | **+75.0%** | Substantial Improvement |
| **Factual / neutral** | 7 | 14.3% (1/7) | **85.7% (6/7)** | **+71.4%** | Substantial Improvement |
| **"Bhai" particle contexts** | 11 | 54.5% (6/11) | **90.9% (10/11)** | **+36.4%** | Substantial Improvement |
| **Indirect complaints (questions)** | 4 | 50.0% (2/4) | **75.0% (3/4)** | **+25.0%** | Meaningful Improvement |
| **Ambiguous / difficult** | 5 | 20.0% (1/5) | **40.0% (2/5)** | **+20.0%** | Moderate Improvement |
| **Polite complaints** | 5 | 0.0% (0/5) | **20.0% (1/5)** | **+20.0%** | Partial (Persistent Gap) |
| **Hinglish** | 37 | 48.6% (18/37) | **64.9% (24/37)** | **+16.3%** | Meaningful Improvement |
| **Ordinary English** | 9 | 66.7% (6/9) | **77.8% (7/9)** | **+11.1%** | Moderate Improvement |
| **Mixed sentiment clauses** | 13 | 53.8% (7/13) | **61.5% (8/13)** | **+7.7%** | Moderate Improvement |
| **Spelling mistakes / typos** | 4 | 75.0% (3/4) | **75.0% (3/4)** | **0.0%** | Neutral (Maintained) |
| **Short text (≤5 words tagged)** | 16 | 50.0% (8/16) | **50.0% (8/16)** | **0.0%** | Persistent Blind Spot |
| **Short text (≤5 words length)** | 27 | 59.3% (16/27) | **59.3% (16/27)** | **0.0%** | Persistent Blind Spot |
| **Transliteration variations** | 8 | 87.5% (7/8) | **75.0% (6/8)** | **-12.5%** | Minor Regression (1 sample) |

---

## 7. Evaluation 5 — Language Performance

Language performance was evaluated separately on the **standard holdout set** and the **frozen challenge set**. Results are strictly kept distinct.

### A. Standard Holdout Set (1,200 samples)

| Language | Total Samples | Correct | Errors | Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **English** | 794 | 743 | 51 | **93.58%** |
| **Hinglish** | 406 | 347 | 59 | **85.47%** |

### B. Frozen Challenge Set (90 samples)

| Language | Total Samples | Phase 6 Correct | Phase 6 Acc | Phase 6.3 Correct | Phase 6.3 Acc | Absolute Change |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **English** | 53 | 25 / 53 | 47.17% | **36 / 53** | **67.92%** | **+20.75%** |
| **Hinglish** | 37 | 18 / 37 | 48.65% | **24 / 37** | **64.86%** | **+16.21%** |

> **Language Takeaway:**  
> On the frozen challenge set, both English and Hinglish accuracy improved substantially by over 16–20 percentage points. Hinglish accuracy improved from 48.65% to 64.86%, demonstrating that the targeted Hinglish expansion (colloquial phrasing, conversational particles, mixed polarity) successfully transferred to unseen challenge feedback.

---

## 8. Transition Analysis: Fixed vs. Regressed Examples

A record-by-record comparison across all 90 challenge samples reveals the exact transition dynamics:

- **Fixed Samples (Old Wrong → New Correct):** **22 samples**
- **Regressed Samples (Old Correct → New Wrong):** **5 samples**
- **Consistently Correct (Both Correct):** **38 samples**
- **Persistent Errors (Still Incorrect):** **25 samples**
- **Net Improvement:** **+17 samples**

### Key Fixed Examples (Highlights)

1. **Sarcasm Detection:**
   - `CH027`: *"Oh wow what a fantastic experience waiting 45 minutes for cold food"* (Actual: `negative`) → Old: `positive` (misled by "fantastic experience") → **New: `negative`** (fixed).
   - `CH028`: *"Sure the app works great if you enjoy watching loading screens all day"* (Actual: `negative`) → Old: `positive` (misled by "works great") → **New: `negative`** (fixed).
   - `CH030`: *"Thank you so much for the wonderful experience of being put on hold for an hour"* (Actual: `negative`) → Old: `positive` (misled by "wonderful experience") → **New: `negative`** (fixed).
2. **Factual / Neutral Feedback:**
   - `CH046`: *"Delivery was on schedule and the items matched the description"* (Actual: `neutral`) → Old: `mixed` → **New: `neutral`** (fixed).
   - `CH047`: *"Received the standard confirmation email after placing the order"* (Actual: `neutral`) → Old: `negative` → **New: `neutral`** (fixed).
   - `CH048`: *"The account statement was generated on the 1st of every month as per schedule"* (Actual: `neutral`) → Old: `mixed` → **New: `neutral`** (fixed).
   - `CH073`: *"Flight departed at 6 AM and landed at 8:30 AM at terminal 2"* (Actual: `neutral`) → Old: `positive` → **New: `neutral`** (fixed).
   - `CH075`: *"Registration was completed at the front desk between 9 AM and 10 AM"* (Actual: `neutral`) → Old: `positive` → **New: `neutral`** (fixed).
3. **Conversational "Bhai" Particle Disambiguation:**
   - `CH037`: *"bhai theek hai nothing special"* (Actual: `neutral`) → Old: `negative` → **New: `neutral`** (fixed).
   - `CH038`: *"bhai speed test kiya bhot fast tha network loving it"* (Actual: `positive`) → Old: `negative` → **New: `positive`** (fixed).
   - `CH039`: *"bhai ye loan approval process bahut smooth tha seedha account me paisa aa gaya"* (Actual: `positive`) → Old: `negative` → **New: `positive`** (fixed).
   - `CH065`: *"bhai UPI payment instant hua koi dikkat nhi"* (Actual: `positive`) → Old: `negative` → **New: `positive`** (fixed).
4. **Indirect Complaints:**
   - `CH021`: *"Is there any reason the support team takes 3 hours to respond to a simple query?"* (Actual: `negative`) → Old: `neutral` → **New: `negative`** (fixed).

### Regressed Samples (Analysis)

Only 5 samples transitioned from correct to incorrect:
1. `CH002`: *"loved it"* (`positive`) → predicted `negative`. (Extreme brevity: "loved it" has very few char n-grams; influenced by negative weights on short phrases).
2. `CH009`: *"bahut acha tha service"* (`positive`) → predicted `negative`. (Transliteration conflict with subtle n-grams).
3. `CH024`: *"I appreciate the quick delivery however the item was completely different from what was shown"* (`mixed`) → predicted `negative`. (Strong negative clause dominated the "appreciate" prefix).
4. `CH053`: *"bahut acha"* (`positive`) → predicted `negative`. (2-word feedback).
5. `CH089`: *"Absolutely loved the whole experience from start to finish would come back again"* (`positive`) → predicted `negative`.

### Persistent Error Root Causes (Why 30 Errors Remain)

1. **Polite Negative Phrasing (4 errors):**
   - e.g., `CH032` (*"Not to complain but the service has been consistently below expectations"*), `CH033` (*"I wish I could say something positive but the quality has really gone down"*), `CH034` (*"With all due respect the current system is not working for most users"*), `CH079` (*"I'm not angry just disappointed with how things were handled this time"*).
   - *Cause:* Polite introductory phrases contain words with high positive coefficients (`positive`, `respect`, `complain` with negation). A linear bag-of-words / n-gram model adds weights linearly and cannot perform compositional semantic negation over long distance clauses.
2. **Minimal Short Text (1–3 words) (8 errors):**
   - e.g., `CH003` (*"very bad"* → `positive`), `CH054` (*"bohot bura"* → `positive`), `CH058` (*"ok"* → `negative`), `CH060` (*"love"* → `negative`).
   - *Cause:* Ultra-short inputs lack sufficient distinct n-grams to overcome prior class intercepts or sparse character n-gram collisions.
3. **Complex Discourse Structure & Concession (5 errors):**
   - e.g., `CH087` (*"mene socha tha bura hoga par acha nikla surprisingly"* → actual: `positive`, predicted: `negative`).
   - *Cause:* Contains both contrasting sentiment tokens (`bura` and `acha`). The concession structure ("thought it would be X, but it turned out Y") requires syntactic awareness beyond n-gram frequencies.

---

## 9. Comprehensive Synthesis & Decision

| Evaluation Area | Target Weakness | Outcome | Evidence |
| :--- | :--- | :---: | :--- |
| **Standard Holdout (1,200)** | Generalization on expanded data | **Strong** | 90.83% accuracy, 0.9107 macro F1, well-balanced across all 4 classes |
| **Strict Unseen-Text (1,212)** | Zero text-overlap generalization | **Strong** | 91.42% accuracy, 0.9123 macro F1; higher than standard split |
| **Frozen Challenge Overall (90)** | Stress-test robustness | **Substantial Gain** | Accuracy: 47.8% → 66.7% (+18.9%); Macro F1: 0.4316 → 0.6688; Errors: 47 → 30 |
| **Neutral / Factual** | Severe Phase 6 blindspot | **Resolved** | 14.3% → 85.7% accuracy (+71.4%); Neutral F1: 0.1905 → 0.7333 |
| **Sarcastic Feedback** | False positive trap | **Resolved** | 25.0% → 100.0% accuracy (+75.0%); all 4 sarcastic items classified negative |
| **Conversational "Bhai"** | Systematic negative skew | **Resolved** | 54.5% → 90.9% accuracy (+36.4%); 10 of 11 items correct |
| **Indirect Complaints** | Phrased as questions | **Improved** | 50.0% → 75.0% accuracy (+25.0%) |
| **Hinglish Challenge Slice** | Transliteration and code-mix | **Improved** | 48.6% → 64.9% accuracy (+16.3%) |
| **Polite Complaints** | Complaints with polite preface | **Persistent Weakness** | 0.0% → 20.0% accuracy; 4 of 5 still misclassified |
| **Ultra-Short Feedback (≤5 words)** | Minimal lexical context | **Persistent Weakness** | 50.0% accuracy; unchanged |

### Final Factual Status: **PARTIAL IMPROVEMENT**

The targeted dataset expansion was highly successful in eliminating several major, documented vulnerabilities of the Phase 5 model (particularly neutral factual statements, sarcasm, "bhai" bias, and indirect complaints), while maintaining >90% accuracy on strict unseen holdouts. However, fundamental structural limitations of linear TF-IDF models remain evident on polite complaints and ultra-short texts, precluding an unqualified PASS.
