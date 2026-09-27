# Dataset Documentation & Data Lineage

This directory manages all datasets used for training, evaluating, and stress-testing the Sentiment Analysis model.

---

## 1. Directory Structure

```
data/
├── processed/
│   ├── sentiment_dataset_production.csv   # Active production training dataset (8,573 records)
│   ├── sentiment_dataset.csv              # Canonical foundation dataset (8,000 records)
│   └── cleaning_log.json                  # Deduplication and normalization audit log
├── test/
│   ├── challenge_dataset.csv              # Frozen adversarial benchmark (90 stress-test cases)
│   ├── phase_7_experiment_dataset.csv     # Phase 7 augmented training set (8,573 records)
│   ├── phase_6_9_experiment_dataset.csv   # Phase 6.9 training set (8,520 records)
│   └── phase_6_9_hinglish_negation.csv    # Phase 6.9 negation expansion (120 records)
├── experiments/
│   ├── phase_6_8_targeted/
│   │   ├── targeted_records.csv           # Phase 6.8 generic sentiment records (400 records)
│   │   └── experiment_dataset.csv         # Phase 6.8 combined dataset (8,400 records)
│   └── phase_7_targeted/
│       ├── targeted_records.csv           # Phase 7 targeted lexical records (53 records)
│       └── create_phase_7_dataset.py      # Dataset generation script
└── raw/                                   # Initial raw scraped / domain feedback dumps
```

---

## 2. Dataset Evolution (Data Lineage)

The production training dataset was built iteratively through targeted data quality cycles to eliminate lexical biases and blind spots:

```
┌────────────────────────────────────────────────────────┐
│  Phase 6.6 Foundation Dataset                          │
│  data/processed/sentiment_dataset.csv                  │
│  8,000 multi-domain service reviews across 10 sectors  │
└──────────────────────────┬─────────────────────────────┘
                           │ + 400 targeted records (Generic English sentiment, "loved", "hate")
┌──────────────────────────▼─────────────────────────────┐
│  Phase 6.8 Dataset (8,400 records)                     │
│  data/experiments/phase_6_8_targeted/experiment_...csv │
└──────────────────────────┬─────────────────────────────┘
                           │ + 120 targeted records (Hinglish negation patterns: "acha nahi laga")
┌──────────────────────────▼─────────────────────────────┐
│  Phase 6.9 Dataset (8,520 records)                     │
│  data/test/phase_6_9_experiment_dataset.csv            │
└──────────────────────────┬─────────────────────────────┘
                           │ + 53 targeted records (Short feedback, polite complaints, "bhai" debiasing)
┌──────────────────────────▼─────────────────────────────┐
│  Phase 7 Production Dataset (8,573 records)            │
│  data/processed/sentiment_dataset_production.csv       │
│  (also at data/test/phase_7_experiment_dataset.csv)    │
└────────────────────────────────────────────────────────┘
```

---

## 3. Data Schema & Columns

Every dataset record follows a standardized 12-column schema:

| Column | Type | Allowed Values | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | e.g. `BK001`, `P70-001` | Unique record identifier with domain/phase prefix. |
| `text` | String | UTF-8 text | Customer review or feedback statement in English or Hinglish. |
| `language` | String | `english`, `hinglish` | Primary linguistic modality. |
| `service` | String | 10 domains or `general` | Industry vertical (banking, food delivery, cab, ecommerce, etc.). |
| `behavior` | String | `appreciation`, `complaint`, `neutral`, `feedback` | High-level user interaction style. |
| `sentiment` | String | `positive`, `negative`, `neutral`, `mixed` | **Target classification label**. |
| `aspect` | String | e.g. `app`, `delivery`, `upi`, `support` | Specific service attribute being evaluated. |
| `issue` | String | e.g. `server_down`, `late_delivery`, `none` | Identified problem category if negative or mixed. |
| `severity` | String | `none`, `low`, `medium`, `high` | Impact level of the complaint. |
| `abuse` | String | `none`, `mild`, `severe` | Profanity / toxic language tag (all filtered to `none`). |
| `complexity` | String | `simple`, `moderate`, `complex` | Syntactic clause depth and length. |
| `suggestion` | String | Free-form string or `none` | Actionable business recommendation. |

---

## 4. Frozen Adversarial Benchmark (`challenge_dataset.csv`)

A fixed, 90-record stress-test benchmark kept strictly separate from all training splits. It tests 13 difficult linguistic edge cases:

1. **Short text ($\le$ 5 words):** `"very bad"`, `"loved it"`, `"ok"`, `"bohot bura"`.
2. **Conversational slang / particles:** Statements containing `"bhai"`, `"yaar"`, `"bro"`.
3. **Indirect complaints:** Rhetorical questions (*"What is the point of membership if..."*).
4. **Polite complaints:** Courteous framing (*"Not to complain but service has been consistently below expectations"*).
5. **Mixed clauses:** Explicit polarity contrast (*"Food was great however delivery took 2 hours"*).
6. **Hinglish transliteration variations:** Spelling divergence (*bohot*, *bahut*, *achha*, *acha*).
7. **Sarcasm:** Tone reversal (*"Great job breaking the app again"*).
8. **Factual queries:** Inquiries with zero emotional polarity.
