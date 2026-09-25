# Dataset Design

## Overview

The project contains **10 service-specific datasets**, organized under `data/raw/<service>/`.
Originally established with 500 records each (5,000 records in Phase 1), the datasets were
systematically expanded in Phase 6.1 (to 600 records each = 6,000 records) and Phase 6.4
(to 800 records each = 8,000 records) to address specific linguistic edge cases discovered
during challenge testing.

Together they form **8,000 records** of multi-domain customer feedback.

## Services

| Code | Relative Path | Service Domain | Records |
| ---- | ------------- | -------------- | ------- |
| BK   | `data/raw/banking_upi/BK.csv` | Banking / UPI | 800 |
| CB   | `data/raw/cab_transport/CB.csv` | Cab / Transport | 800 |
| CS   | `data/raw/customer_support/CS.csv` | Customer Support | 800 |
| EC   | `data/raw/ecommerce/EC.csv` | E-commerce | 800 |
| ED   | `data/raw/education/ED.csv` | Education / EdTech | 800 |
| FD   | `data/raw/food_delivery/FD.csv` | Food Delivery / Restaurant | 800 |
| GR   | `data/raw/grocery_delivery/GR.csv` | Grocery Delivery | 800 |
| HC   | `data/raw/healthcare/HC.csv` | Healthcare / Consultations | 800 |
| TC   | `data/raw/telecom/TC.csv` | Telecom / Broadband | 800 |
| TR   | `data/raw/travel_hotels/TR.csv` | Travel / Hospitality | 800 |

## Dataset Structure (Canonical 12 Columns)

| Column       | Description                              | Example Values                    |
| ------------ | ---------------------------------------- | --------------------------------- |
| `id`         | Unique identifier per record             | `BK001`, `CB650`, `FD800`         |
| `text`       | Raw feedback text                        | `"Food was good."`                |
| `language`   | Language of the text                     | `english`, `hinglish`             |
| `service`    | Service domain                           | `food_delivery`, `banking_upi`    |
| `behavior`   | User behavior type                       | `appreciation`, `complaint`, `question`, `suggestion` |
| `sentiment`  | Sentiment label                          | `positive`, `negative`, `neutral`, `mixed` |
| `aspect`     | What the feedback is about               | `food_quality`, `delivery_time`, `app`, `upi` |
| `issue`      | Specific issue (if any)                  | `late_delivery`, `refund_delay`, `none` |
| `severity`   | Severity of the issue                    | `none`, `low`, `medium`, `high`   |
| `abuse`      | Presence of abusive language             | `none`, `mild`, `severe`          |
| `complexity` | Complexity of the text                   | `simple`, `moderate`, `complex`   |
| `suggestion` | User's suggestion (if any)               | `"Speed up refund processing"`, `none` |

## Allowed Values

### Language
- `english` — Standard English
- `hinglish` — Romanized Hindi-English mix (e.g., `"bhai refund abhi tak nahi hua"`)

### Sentiment
- `positive`
- `negative`
- `neutral`
- `mixed` — Contains both positive and negative elements (e.g., `"Food was tasty but delivery was late"`)

### Behavior
- `appreciation` — Praising the service
- `complaint` — Reporting a problem
- `question` — Asking for information
- `suggestion` — Recommending an improvement
- `informational` — Factual statements or status updates

### Abuse
- `none`
- `mild`
- `severe`

### Severity
- `none`
- `low`
- `medium`
- `high`

### Complexity
- `simple` — Short, straightforward text
- `moderate` — Normal-length, clear text
- `complex` — Long, indirect, or nuanced text

## Writing Styles Present

The datasets incorporate natural linguistic variations to reflect realistic customer service interactions:

- **Short** — Terse expressions (e.g., `"bahut acha"`, `"worst"`)
- **Normal** — Standard 1-2 sentence feedback
- **Long** — Detailed multi-clause customer feedback
- **Complex / Nuanced** — Indirect phrasing, polite complaints, sarcasm
- **Conversational** — Casual chat particles (e.g., *"bhai"*, *"yaar"*)
- **Transliteration Variations** — Phonetic Roman Hindi spellings (e.g., *bohot* / *bahut*, *nhi* / *nahi*)
- **Code-mixed** — Hinglish (Hindi words written in Latin script interspersed with English)

## Raw, Processed, and Test Data

### Raw Data (`data/raw/<service>/<CODE>.csv`)
- 10 service CSV files containing 800 raw, annotated rows each (8,000 total).
- 100% immutable and preserved in their native folder structure.

### Processed Training Data (`data/processed/sentiment_dataset.csv`)
- Generated deterministically via `ml/preprocessing/clean_datasets.py`.
- Merges all 8,000 rows into a unified, canonical 12-column dataset.
- 0 missing values, 0 duplicate IDs, and normalized categorical labels.
- Reconstructed 369 legacy shifted rows without data loss.

### Adversarial Challenge Test Data (`data/test/challenge_dataset.csv`)
- A permanently frozen, manually curated evaluation set of 90 diagnostic samples.
- Used exclusively for qualitative diagnostic evaluation of model failure modes (sarcasm, negation, polite complaints, transliteration, short text).
- Never used in model training or validation tuning.

