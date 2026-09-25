# Final Model Validation — Challenge Dataset Report (Phase 6)

## 1. Purpose

This report documents the **challenge testing** of the selected Phase 5 candidate
model (Experiment 3: Combined Word + Character n-grams with Logistic Regression)
on a **manually curated, independent challenge dataset** before integrating the model
into the Django production API.

The challenge dataset is designed to **stress-test known model weaknesses** identified
in Phase 4 and Phase 5, including:
- Short / minimal-length feedback
- Hinglish transliteration variations
- Spelling mistakes and typos
- Indirect complaints phrased as questions
- Polite and sarcastic complaints
- Mixed sentiment with contrasting clauses
- The "bhai" particle in both positive and negative contexts
- Factual / neutral statements
- Ambiguous / difficult examples

---

## 2. Dataset Composition

- **Source:** [`data/test/challenge_dataset.csv`](file:///c:/Users/hp/OneDrive/Desktop/Sentiment%20Analysis/data/test/challenge_dataset.csv)
- **Total samples:** 90
- **Columns:** `id`, `text`, `language`, `sentiment`
- **Label assignment:** Manual human judgment (NOT model predictions)
- **Training data overlap:** 0 texts shared with `data/processed/sentiment_dataset.csv`

### Class Distribution

| Class | Count |
| :--- | :---: |
| `positive` | 23 |
| `negative` | 35 |
| `neutral` | 16 |
| `mixed` | 16 |

### Language Distribution

| Language | Count | Accuracy |
| :--- | :---: | :---: |
| `english` | 53 | 47.2% |
| `hinglish` | 37 | 48.6% |

### Challenge Categories Covered

| Category | Samples | Accuracy |
| :--- | :---: | :---: |
| Short text (≤5 words) | 16 | 50.0% |
| Hinglish | 37 | 48.6% |
| Transliteration variations | 8 | 87.5% |
| Spelling mistakes / typos | 4 | 75.0% |
| Indirect complaints (questions) | 4 | 50.0% |
| Polite complaints | 5 | 0.0% |
| Sarcastic complaints | 4 | 25.0% |
| Mixed sentiment clauses | 13 | 53.8% |
| "bhai" particle contexts | 11 | 54.5% |
| Ordinary English | 9 | 66.7% |
| Factual / neutral | 7 | 14.3% |
| Ambiguous / difficult | 5 | 20.0% |

---

## 3. Evaluation Methodology

- **Model under test:** Exp 3 (Combined Word + Character n-grams)
  - `FeatureUnion(Word TfidfVectorizer(1,1) + Char_wb TfidfVectorizer(3,5))`
  - `LogisticRegression(max_iter=1000, class_weight=None, random_state=42)`
- **Artifacts:** `ml/models/sentiment_best_model.pkl` and `ml/models/sentiment_best_vectorizer.pkl`
- **Evaluation protocol:** Direct inference on challenge dataset — no train/test split needed
  (challenge data is entirely independent from training data).
- **Metrics:** Accuracy, macro & weighted precision/recall/F1, per-class metrics, confusion matrix.
- **Category analysis:** Each challenge example is tagged with categories (e.g., `short`, `sarcasm`,
  `bhai`, `transliteration`) to measure slice-level performance.

---

## 4. Overall Results

| Metric | Value |
| :--- | :---: |
| **Overall Accuracy** | **47.8%** |
| **Macro Precision** | 0.4573 |
| **Macro Recall** | 0.4489 |
| **Macro F1-Score** | **0.4316** |
| **Weighted Precision** | 0.4712 |
| **Weighted Recall** | 0.4778 |
| **Weighted F1-Score** | **0.4589** |
| **Total Errors** | 47 / 90 |

---

## 5. Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| `positive` | 0.5200 | 0.5652 | 0.5417 | 23 |
| `negative` | 0.5000 | 0.5429 | 0.5205 | 35 |
| `neutral` | 0.4000 | 0.1250 | 0.1905 | 16 |
| `mixed` | 0.4091 | 0.5625 | 0.4737 | 16 |

---

## 6. Confusion Matrix

| Actual \ Predicted | positive | negative | neutral | mixed |
| :--- | :---: | :---: | :---: | :---: |
| **positive** | 13 | 8 | 0 | 2 |
| **negative** | 7 | 19 | 3 | 6 |
| **neutral** | 2 | 7 | 2 | 5 |
| **mixed** | 3 | 4 | 0 | 9 |

---

## 7. Category-Wise Performance

| Category | Samples | Correct | Errors | Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| Short text (≤5 words) | 16 | 8 | 8 | 50.0% |
| Transliteration variations | 8 | 7 | 1 | 87.5% |
| Spelling mistakes / typos | 4 | 3 | 1 | 75.0% |
| Indirect complaints (questions) | 4 | 2 | 2 | 50.0% |
| Polite complaints | 5 | 0 | 5 | 0.0% |
| Sarcastic complaints | 4 | 1 | 3 | 25.0% |
| Mixed sentiment clauses | 13 | 7 | 6 | 53.8% |
| "bhai" particle contexts | 11 | 6 | 5 | 54.5% |
| Ordinary English | 9 | 6 | 3 | 66.7% |
| Factual / neutral | 7 | 1 | 6 | 14.3% |
| Ambiguous / difficult | 5 | 1 | 4 | 20.0% |

---

## 8. Language-Based Performance

| Language | Total | Correct | Errors | Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| `english` | 53 | 25 | 28 | 47.2% |
| `hinglish` | 37 | 18 | 19 | 48.6% |

### Short Text Performance (≤5 words)

- Total: 27, Correct: 16, Errors: 11, Accuracy: **59.3%**

---

## 9. Detailed Error Analysis

Total errors: **47** out of 90 samples.

| # | ID | Actual | Predicted | Conf. | Language | Categories | Text |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| 1 | `CH003` | `negative` | `positive` | 71.3% | english | short | *"very bad"* |
| 2 | `CH005` | `neutral` | `mixed` | 30.9% | english | short | *"okay product"* |
| 3 | `CH006` | `neutral` | `mixed` | 45.9% | english | short | *"it was fine"* |
| 4 | `CH008` | `mixed` | `positive` | 52.2% | english | short | *"nice food bad delivery"* |
| 5 | `CH015` | `negative` | `positive` | 51.9% | hinglish | hinglish, transliteration | *"bohot kharab service thi"* |
| 6 | `CH017` | `neutral` | `negative` | 55.6% | hinglish | hinglish | *"theek thaak tha kuch khaas nhi"* |
| 7 | `CH018` | `neutral` | `negative` | 78.2% | hinglish | hinglish | *"chalega koi baat nhi"* |
| 8 | `CH021` | `negative` | `neutral` | 60.9% | english | indirect_complaint | *"Is there any reason the support team takes 3 hours to respond to a simple query?"* |
| 9 | `CH022` | `negative` | `neutral` | 60.1% | english | indirect_complaint | *"What exactly is the point of premium membership if benefits keep changing?"* |
| 10 | `CH027` | `negative` | `positive` | 51.4% | english | sarcasm | *"Oh wow what a fantastic experience waiting 45 minutes for cold food"* |
| 11 | `CH028` | `negative` | `positive` | 34.5% | english | sarcasm | *"Sure the app works great if you enjoy watching loading screens all day"* |
| 12 | `CH030` | `negative` | `positive` | 51.7% | english | sarcasm | *"Thank you so much for the wonderful experience of being put on hold for an hour"* |
| 13 | `CH031` | `negative` | `mixed` | 78.3% | english | polite_complaint | *"I understand these things happen but the repeated delays are getting frustrating"* |
| 14 | `CH032` | `negative` | `mixed` | 74.1% | english | polite_complaint | *"Not to complain but the service has been consistently below expectations"* |
| 15 | `CH033` | `negative` | `mixed` | 86.0% | english | polite_complaint | *"I wish I could say something positive but the quality has really gone down"* |
| 16 | `CH034` | `negative` | `neutral` | 42.6% | english | polite_complaint | *"With all due respect the current system is not working for most users"* |
| 17 | `CH037` | `neutral` | `negative` | 76.7% | hinglish | bhai, hinglish | *"bhai theek hai nothing special"* |
| 18 | `CH038` | `positive` | `negative` | 42.1% | hinglish | bhai, hinglish | *"bhai speed test kiya bhot fast tha network loving it"* |
| 19 | `CH039` | `positive` | `negative` | 58.2% | hinglish | bhai, hinglish | *"bhai ye loan approval process bahut smooth tha seedha account me paisa aa gaya"* |
| 20 | `CH041` | `positive` | `mixed` | 51.7% | english | ordinary | *"The new update has improved the interface significantly and everything runs smoo..."* |
| 21 | `CH043` | `positive` | `negative` | 54.8% | english | ordinary | *"Excellent value for money I would definitely recommend this to everyone"* |
| 22 | `CH046` | `neutral` | `mixed` | 56.7% | english | factual | *"Delivery was on schedule and the items matched the description"* |
| 23 | `CH047` | `neutral` | `negative` | 40.8% | english | factual | *"Received the standard confirmation email after placing the order"* |
| 24 | `CH048` | `neutral` | `mixed` | 51.9% | english | factual | *"The account statement was generated on the 1st of every month as per schedule"* |
| 25 | `CH051` | `negative` | `mixed` | 55.1% | english | typos | *"delievry was late and produt was damaegd"* |
| 26 | `CH054` | `negative` | `positive` | 80.3% | hinglish | short, hinglish | *"bohot bura"* |
| 27 | `CH055` | `neutral` | `negative` | 68.9% | hinglish | short, hinglish | *"theek hai"* |
| 28 | `CH058` | `neutral` | `negative` | 40.9% | english | short | *"ok"* |
| 29 | `CH060` | `positive` | `negative` | 36.6% | english | short | *"love"* |
| 30 | `CH062` | `mixed` | `negative` | 86.0% | hinglish | mixed_sentiment, hinglish | *"Teacher ka padhane ka tarika acha tha lekin class me bahut shor tha concentrate ..."* |
| 31 | `CH065` | `positive` | `negative` | 81.8% | hinglish | bhai, hinglish | *"bhai UPI payment instant hua koi dikkat nhi"* |
| 32 | `CH067` | `positive` | `negative` | 87.0% | hinglish | bhai, hinglish | *"bhai doctor ne time pe dekha aur dawai bhi sahi di"* |
| 33 | `CH069` | `positive` | `negative` | 81.7% | hinglish | hinglish | *"ye product toh sach me kamaal ka hai quality top notch hai"* |
| 34 | `CH072` | `negative` | `mixed` | 44.8% | english | ordinary | *"I have been trying to reach customer support for 5 days but nobody picks up the ..."* |
| 35 | `CH073` | `neutral` | `positive` | 60.8% | english | factual | *"Flight departed at 6 AM and landed at 8:30 AM at terminal 2"* |
| 36 | `CH074` | `neutral` | `mixed` | 79.8% | english | factual | *"The medicine was available at the pharmacy counter on the ground floor"* |
| 37 | `CH075` | `neutral` | `positive` | 47.8% | english | factual | *"Registration was completed at the front desk between 9 AM and 10 AM"* |
| 38 | `CH076` | `mixed` | `positive` | 40.3% | hinglish | mixed_sentiment, hinglish | *"acha bhi hai aur bura bhi depends on your expectations honestly"* |
| 39 | `CH077` | `mixed` | `positive` | 45.3% | hinglish | mixed_sentiment, hinglish | *"service fast thi par attitude bohot rude tha staff ka"* |
| 40 | `CH078` | `mixed` | `negative` | 48.3% | hinglish | mixed_sentiment, hinglish | *"khana tasty tha par plates gande the hygiene zero"* |
| 41 | `CH079` | `negative` | `positive` | 42.3% | english | polite_complaint | *"I'm not angry just disappointed with how things were handled this time"* |
| 42 | `CH081` | `mixed` | `negative` | 83.4% | hinglish | mixed_sentiment, hinglish | *"paise toh zyada lge par quality dekhke lagta hai sahi hai"* |
| 43 | `CH082` | `positive` | `mixed` | 71.5% | english | ambiguous | *"Honestly I expected much worse but it turned out to be decent enough"* |
| 44 | `CH083` | `mixed` | `negative` | 74.4% | hinglish | mixed_sentiment, hinglish | *"wifi speed thik thi par raat ko signal gayab ho jata tha"* |
| 45 | `CH084` | `negative` | `mixed` | 47.0% | english | ambiguous | *"The return policy says 7 days but my return request was rejected on day 5 withou..."* |
| 46 | `CH087` | `positive` | `negative` | 52.2% | hinglish | ambiguous, hinglish | *"mene socha tha bura hoga par acha nikla surprisingly"* |
| 47 | `CH088` | `neutral` | `negative` | 83.1% | hinglish | ambiguous, hinglish | *"koi complaint nhi hai sab normal tha as expected"* |

### Error Breakdown by Category

| Category | Error Count |
| :--- | :---: |
| Ambiguous / difficult | 4 |
| "bhai" particle contexts | 5 |
| Factual / neutral | 6 |
| Hinglish | 19 |
| Indirect complaints (questions) | 2 |
| Mixed sentiment clauses | 6 |
| Ordinary English | 3 |
| Polite complaints | 5 |
| Sarcastic complaints | 3 |
| Short text (≤5 words) | 8 |
| Transliteration variations | 1 |
| Spelling mistakes / typos | 1 |

---

## 10. Key Observations

1. **Overall challenge accuracy (47.8%)** indicates the model struggles on deliberately adversarial inputs.
2. **Hinglish accuracy (48.6%)** on challenge examples (19 errors out of 37). Character n-grams help with transliteration but some bias patterns remain.
3. **Short text accuracy (59.3%)** (11 errors out of 27). Very short feedback remains challenging due to limited lexical signal.
4. **Sarcasm detection (25.0%)** — 1/4 correct. Sarcastic language inverts literal meaning, which bag-of-words approaches cannot detect structurally.
5. **Mixed sentiment (53.8%)** — 7/13 correct. Feedback with contrasting clauses is inherently difficult for linear models.
6. **"bhai" particle contexts (54.5%)** — 6/11 correct. Tests whether the model correctly handles both positive and negative uses of 'bhai'.

---

## 11. Limitations

1. **Challenge dataset is small (90 examples):** Results are indicative but not statistically robust. Individual errors have large impact on percentages.
2. **Labels are subjective:** Some examples (e.g., ambiguous, mixed) are borderline and reasonable disagreement is possible.
3. **Model is bag-of-words / bag-of-characters:** It cannot detect sarcasm, irony, or rhetorical structures that require understanding of word order and pragmatics.
4. **No external vocabulary expansion:** The model vocabulary is limited to what appeared in the 5,000 training examples. Rare typos or novel slang may be OOV.

---

## 12. Validation Gate Decision

### ❌ NEEDS REVIEW

The model achieves **47.8% accuracy** and **0.4316 macro F1** on the challenge dataset, which is below the validation gate thresholds (≥75% accuracy, ≥0.70 macro F1).

**Further investigation or improvement is recommended before production integration.**

---

## 13. Reproduction

```bash
python ml/evaluation/evaluate_challenge.py --report docs/FINAL_MODEL_VALIDATION.md
```
