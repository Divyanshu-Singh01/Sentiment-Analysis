# Diagnostic Investigation: Why "I absolutely loved this product." is Predicted as Negative

> **Document Type:** Read-Only Model Diagnostic Report  
> **Target Query:** `"I absolutely loved this product."`  
> **Model Artifacts Inspected:** `ml/models/sentiment_final_model.pkl`, `ml/models/sentiment_final_vectorizer.pkl`  
> **Dataset Inspected:** `data/processed/sentiment_dataset.csv` (8,000 records)  
> **Methodology:** Direct inspection of model weights, intercepts, decision scores, and training data co-occurrences.

---

## 1. Reproduction of Exact Failure

Using the exact production loading and preprocessing logic from `analyzer/views.py`:

```python
text = "I absolutely loved this product."
cleaned_text = text.strip().lower()
text_tfidf = vectorizer.transform([cleaned_text])
prediction = model.predict(text_tfidf)[0]
probs = model.predict_proba(text_tfidf)[0]
```

### Results:
- **Predicted Sentiment:** `negative`
- **Positive Probability:** **41.58%**
- **Negative Probability:** **43.17%**
- **Neutral Probability:** **13.16%**
- **Mixed Probability:** **2.09%**
- **Probability Margin:** Negative beats Positive by **1.59%** (absolute difference: **0.0159**).

This precisely replicates the runtime behavior observed in the production application.

---

## 2. Controlled Diagnostic Set

The exact production model and vectorizer were evaluated on 10 controlled variations:

| Input Text | Prediction | Positive % | Negative % | Neutral % | Mixed % |
| :--- | :--- | ---: | ---: | ---: | ---: |
| `I absolutely loved this product.` | **negative** | 41.58% | 43.17% | 13.16% | 2.09% |
| `I loved this product.` | **negative** | 35.67% | 45.02% | 17.95% | 1.36% |
| `I loved the product.` | **negative** | 36.72% | 49.73% | 6.47% | 7.07% |
| `Absolutely loved this product.` | **positive** | 44.50% | 39.87% | 13.44% | 2.20% |
| `I absolutely love this product.` | **negative** | 28.94% | 38.21% | 28.78% | 4.08% |
| `I really loved this product.` | **negative** | 38.25% | 41.69% | 18.29% | 1.77% |
| `This product is amazing.` | **neutral** | 10.04% | 23.61% | 60.91% | 5.43% |
| `This is an excellent product.` | **neutral** | 16.54% | 10.52% | 66.75% | 6.19% |
| `I hated this product.` | **neutral** | 13.31% | 23.84% | 60.45% | 2.40% |
| `This product was horrible.` | **negative** | 8.44% | 39.72% | 37.07% | 14.77% |

### Key Observations from the Diagnostic Set:
1. When `"I "` is removed (`"Absolutely loved this product."`), the prediction flips to **positive** (44.50% vs 39.87%).
2. Generic declarative reviews using the token `"product"` with copula verbs (`"This product is amazing."`, `"This is an excellent product."`) classify as **neutral** (60.91% and 66.75%).

---

## 3. Training Dataset Analysis for the Token `loved`

A token-aware case-insensitive regular expression search (`\bloved\b`) on `data/processed/sentiment_dataset.csv` yielded:

- **Total Matching Records:** **31**
- **Sentiment Breakdown:**
  - `negative`: **20 records (64.5%)**
  - `positive`: **11 records (35.5%)**
  - `neutral`: **0 records (0.0%)**
  - `mixed`: **0 records (0.0%)**
- **Service Distribution:**
  - `food_delivery`: 5
  - `grocery_delivery`: 4
  - `healthcare`: 4
  - `telecom_internet`: 4
  - `travel_hotels`: 4
  - `banking_upi`: 3
  - `ecommerce`: 3
  - `customer_support`: 2
  - `education`: 2
- **Language Distribution:** English (31/31)
- **Behavior Distribution:**
  - `complaint`: 20 records (100% of the negative instances)
  - `appreciation`: 11 records (100% of the positive instances)
- **Abuse Distribution:** `none` (31/31)

### Actual Matching Training Records:

#### Negative Records (20 instances — 100% are Sarcastic Customer Complaints):
1. `[BK597]` *"Loved how the transaction failed instantly but the refund requires seven working days of meditation."*
2. `[BK794]` *"Loved how you charged me Rs 500 penalty for having insufficient balance by exactly ten rupees."*
3. `[CB597]` *"Loved the scenic roller coaster experience as the driver swerved between three highway lanes at 100 kmph."*
4. `[CB794]` *"Loved the roller coaster ride on city roads, speed breakers are clearly meant to be jumped over."*
5. `[CS597]` *"Loved how the executive marked my ticket as resolved while my money is still missing from existence."*
6. `[CS794]` *"Loved the customer support agent who told me to Google the solution to their own app error."*
7. `[EC597]` *"Loved the surprise mystery box experience, ordered a mixer grinder and received a dog collar."*
8. `[EC794]` *"Loved the paper thin packaging, my ceramic mug arrived pre-powdered for convenience."*
9. `[ED597]` *"Loved the interactive doubt clearing session where the instructor muted everyone and talked to himself."*
10. `[ED794]` *"Loved the updated study app, crashes right when I open the semester question bank."*
11. `[FD597]` *"Loved the free ice therapy, delivered my hot ramen ice cold after a two hour tour of the city."*
12. `[FD794]` *"Loved the open pizza box where the delivery boy clearly tested the toppings for quality assurance."*
13. `[GR597]` *"Loved the artistic egg scramble pre-made inside the delivery bag by placing ten kilos of flour on top."*
14. `[GR794]` *"Loved the fresh vegetables, the green chillies had evolved their own ecosystem of white mould."*
15. `[HC597]` *"Loved the ultra-fast hospital discharge, spent merely eight hours sitting on a wooden bench waiting for one stamp."*
16. `[HC794]` *"Loved the blood test technique, turning both my arms blue and purple is a work of art."*
17. `[TC597]` *"Loved the surprise mystery charges on my bill, another Rs 300 added for a horoscope service I never asked for."*
18. `[TC794]` *"Loved the unlimited data plan, throttling speed to 128 kbps after downloading three video files."*
19. `[TR599]` *"Loved the sauna treatment in the sleeper bus, paying AC fare for a non functional blower on a 42 degree summer afternoon."*
20. `[TR794]` *"Loved the complimentary breakfast, cold stale bread and empty juice containers are peak hospitality."*

#### Positive Records (11 instances — Genuine Appraisals):
1. `[BK660]` *"Loved the new UI."*
2. `[CS659]` *"Loved the quick chat."*
3. `[EC657]` *"Loved the packaging."*
4. `[ED657]` *"Loved the practical projects."*
5. `[FD057]` *"Pav bhaji was extremely buttery and street-style authentic, loved it completely."*
6. `[FD391]` *"Crisp golden dosas, thick flavorful sambar, and fresh coconut chutney, loved it."*
7. `[FD657]` *"Loved the taste."*
8. `[GR376]` *"Exceptional quality of organic Alphonso mangoes, sweet natural aroma, zero carbide, loved it."*
9. `[GR657]` *"Loved the freshness."*
10. `[TC657]` *"Loved the coverage."*
11. `[TR657]` *"Loved the view."*

---

## 4. Model Coefficients for `loved`

The model is a scikit-learn `LogisticRegression` fitted on a 37,640-feature `FeatureUnion`.

The exact feature `word__loved` exists at index 2,917. Its learned coefficients are:

- **Positive:** **`+0.7700`**
- **Negative:** **`+0.5868`**
- **Neutral:** **`-0.6322`**
- **Mixed:** **`-0.7246`**

### Finding:
While the feature `word__loved` has its highest coefficient for `positive` (`+0.7700`), it **also has a substantial positive coefficient for `negative` (`+0.5868`)**. The net advantage for Positive over Negative from the word feature alone is only **`+0.1832`**. Because of the 20 sarcastic complaint training examples, the model learned that the word `loved` is frequently an indicator of negative customer sentiment.

---

## 5. Active Features in `"I absolutely loved this product."`

The vectorized representation of `"i absolutely loved this product."` has **74 active (nonzero) features**.

### A. Word Features:
| Feature | Positive Coef | Negative Coef | Positive Contribution ($x_i \cdot w_{pos}$) | Negative Contribution ($x_i \cdot w_{neg}$) | Net Impact |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `word__loved` | +0.7700 | +0.5868 | +0.3855 | +0.2938 | Favors Positive (+0.0917) |
| `word__product` | +0.2528 | -0.0069 | +0.1116 | -0.0030 | Favors Positive (+0.1146) |
| `word__absolutely` | +0.0741 | -0.0536 | +0.0470 | -0.0340 | Favors Positive (+0.0810) |
| `word__this` | -0.4218 | -0.1017 | -0.1642 | -0.0396 | **Favors Negative (-0.1246)** |

### B. Most Influential Character Features (`char_wb`):
| Feature | Type | Positive Coef | Negative Coef | Net Impact ($pos - neg$) | Favors |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `char__ i ` | char_wb | -0.5980 | +1.0957 | **-0.1458** | **Negative** |
| `char__ ab` | char_wb | -0.2810 | +0.1562 | **-0.0470** | **Negative** |
| `char__ lo` | char_wb | -0.1655 | +0.2846 | **-0.0334** | **Negative** |
| `char__tely` | char_wb | +0.1285 | +0.4421 | **-0.0297** | **Negative** |
| `char__ thi` | char_wb | -0.2456 | +0.0852 | **-0.0268** | **Negative** |
| `char__ly ` | char_wb | +0.6008 | -0.3603 | **+0.0537** | **Positive** |
| `char__sol ` | char_wb | +0.2775 | -0.2745 | **+0.0513** | **Positive** |
| `char__ved ` | char_wb | +0.5573 | +0.0286 | **+0.0466** | **Positive** |

### Crucial Finding on Character N-grams:
The character unigram `char__ i ` (representing the pronoun token `"I "`) has a coefficient of **`+1.0957` for Negative** and **`-0.5980` for Positive**. In customer service datasets, complaints are overwhelmingly phrased in the first person (*"I paid...", "I waited...", "I was charged..."*), leading the linear model to associate `"I "` with negative sentiment.

---

## 6. Exact Class-Score Calculation (Pre-Softmax)

For linear multi-class Logistic Regression, the decision function for class $k$ is:
$$\text{Score}_k = \text{Intercept}_k + \sum_{i=1}^{D} x_i \cdot w_{k,i}$$

### Model Intercepts:
- **Negative Intercept:** **`+0.6233`**
- **Neutral Intercept:** **`+0.3555`**
- **Positive Intercept:** **`+0.1103`**
- **Mixed Intercept:** **`-1.0891`**

### Active Feature Sums:
- $\sum x_i \cdot w_{neg,i} =$ **`+0.4396`**
- $\sum x_i \cdot w_{pos,i} =$ **`+0.9151`**
- $\sum x_i \cdot w_{neu,i} =$ **`-0.4802`**
- $\sum x_i \cdot w_{mix,i} =$ **`-0.8745`**

### Total Decision Scores:
- **Negative Decision Score:** $+0.6233 + 0.4396 =$ **`+1.0629`**
- **Positive Decision Score:** $+0.1103 + 0.9151 =$ **`+1.0254`**
- **Neutral Decision Score:** $+0.3555 - 0.4802 =$ **`-0.1247`**
- **Mixed Decision Score:** $-1.0891 - 0.8745 =$ **`-1.9636`**

### Why Negative Beat Positive:
1. The **active features alone favored Positive** by **`+0.4755`** (`+0.9151` vs `+0.4396`).
2. However, the **class intercept favored Negative** by **`+0.5130`** (`+0.6233` vs `+0.1103`).
3. Net Difference: $+0.5130 - 0.4755 =$ **`+0.0375` in favor of Negative**.

When passed through the softmax function, this $0.0375$ decision margin produces the close probabilities:
- $\text{softmax}(1.0629) =$ **`43.17%`** (Negative)
- $\text{softmax}(1.0254) =$ **`41.58%`** (Positive)

---

## 7. Dataset Class Distribution and Intercept Correlation

The class distribution in `data/processed/sentiment_dataset.csv` is:
- **Negative:** 3,275 records (**40.94%**)
- **Positive:** 1,761 records (**22.01%**)
- **Neutral:** 1,734 records (**21.68%**)
- **Mixed:** 1,230 records (**15.38%**)

### Impact:
Because `class_weight=None` was chosen during training, the Logistic Regression optimization explicitly fits the class intercepts to reflect the empirical prior probabilities ($\ln(P(y))$). This gives the majority Negative class a **+0.5130 prior head-start** over Positive.

---

## 8. Positive Vocabulary Distribution in Training Data

A token-level search for common positive and praise words in `data/processed/sentiment_dataset.csv` reveals:

| Keyword | Total Dataset Occurrences | Positive Class Occurrences | Percentage Positive |
| :--- | :---: | :---: | :---: |
| `love` | **0** | **0** | **0.0%** |
| `loved` | **31** | **11** | **35.5%** |
| `awesome` | **0** | **0** | **0.0%** |
| `amazing` | **3** | **2** | **66.7%** |
| `good` | **29** | **6** | **20.7%** |
| `excellent` | **21** | **11** | **52.4%** |
| `great` | **86** | **44** | **51.2%** |

In this service feedback dataset, positive sentiment is predominantly conveyed by domain-specific praise tokens (e.g., `fast`, `smooth`, `clean`, `instant`, `helpful`, `resolved`, `acha`, `badhiya`) rather than general product review verbs like `love`.

---

## 9. Actual Root Cause Analysis

Based strictly on empirical evidence, the failure is caused by a conjunction of three verified factors:

1. **Sarcastic Training Examples on the Feature `word__loved` (Strong Evidence):**
   64.5% (20 of 31) of the training records containing `loved` are sarcastic negative complaints (*"Loved the cold pizza...", "Loved the 2 hour wait..."*). This inflated `word__loved`'s negative coefficient to `+0.5868`, eroding its ability to strongly offset competing negative weights.
2. **Class Intercept Prior Disparity (Strong Evidence):**
   The class imbalance (40.94% Negative vs 22.01% Positive) created an intercept gap of `+0.5130` in favor of Negative. The sentence's net positive feature score (`+0.4755`) was insufficient by just `0.0375` to overcome this baseline bias.
3. **First-Person Pronoun Negative Association (Strong Evidence):**
   The character feature `char__ i ` contributes `-0.1458` against Positive because first-person phrasing in customer support corpora is heavily correlated with reporting service grievances.

---

## 10. Comparative Validation

When tested against sentences containing stronger domain-aligned praise words:

| Test Sentence | Predicted | Positive % | Negative % | Neutral % | Mixed % |
| :--- | :--- | ---: | ---: | ---: | ---: |
| `I absolutely loved this product.` | **negative** | 41.58% | 43.17% | 13.16% | 2.09% |
| `Very good product, loved it!` | **positive** | **81.03%** | 13.07% | 2.23% | 3.67% |
| `Loved the packaging, highly satisfied.` | **positive** | **86.16%** | 8.37% | 2.92% | 2.55% |
| `Great product, works really well.` | **positive** | **60.88%** | 15.40% | 5.88% | 17.84% |
| `Awesome app, fast and smooth delivery.` | **positive** | **96.01%** | 0.66% | 0.31% | 3.02% |

### Why the Comparison Sentences Succeeded:
In sentences like `"Very good product, loved it!"` and `"Loved the packaging, highly satisfied."`, strong unambiguous service-praise tokens (`satisfied`, `good`, `packaging`) introduce large positive feature weights (e.g., `word__satisfied` has $w_{pos} = +2.41$, $w_{neg} = -1.12$) that easily overcome both the intercept gap and the sarcasm weight on `loved`.
