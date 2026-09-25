# Current State of the Project

> **Single Source of Truth**  
> This document reflects the verified, actual state of the Sentiment Analysis project following the completion of Phase 7 (Authentication, Session CSRF, Quota Enforcement, Confidence Scoring & Close-Prediction UI, and Subtle Motion/Visual Polish).

---

## 1. Project Purpose

The Sentiment Analysis project is an end-to-end, college-level machine learning and full-stack web application. Its goal is to analyze real-world service feedback, comments, and customer reviews in both English and Roman Hindi (Hinglish), categorizing them into four distinct sentiment classes (**Positive**, **Negative**, **Neutral**, and **Mixed**).

The application is built to demonstrate practical, explainable machine learning engineering, robust REST API design with Django, real-world session authentication, CSRF security, and a modern single-page React user interface.

---

## 2. Current Technology Stack

### Backend & Machine Learning
* **Language:** Python 3.13
* **Web Framework:** Django 6.1.1
* **API Framework:** Django REST Framework 3.18.1
* **Machine Learning:** scikit-learn 1.9.1
* **Data Processing:** pandas 2.3.3, NumPy 2.5.3
* **Model Serialization:** joblib 1.6.0
* **Database & Sessions:** SQLite 3 (`db.sqlite3`) for Django user records and encrypted session storage

### Frontend
* **Core:** React 19
* **Build Tool:** Vite 8.3.0
* **Styling:** Vanilla CSS & Tailwind CSS 4 with custom dark copper glassmorphic tokens
* **Icons:** Lucide React
* **Linter:** oxlint (0 errors, 0 warnings across 17 files)

---

## 3. Current Architecture & Runtime Flow

The system operates as a decoupled client-server architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│         Single-Page App running on Port 5173 / IPv4 / IPv6   │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / Reverse Proxy (`/api/*`)
                               │ Credentials: same-origin, X-CSRFToken
┌──────────────────────────────▼───────────────────────────────┐
│                   Django REST Framework API                  │
│       Running on Port 8000 (CsrfEnforcedSessionAuth)         │
├──────────────────────────────────────────────────────────────┤
│ 1. Session & CSRF Verification (CSRF_TRUSTED_ORIGINS)        │
│ 2. Anonymous Quota Guard (10 successful predictions / sess)  │
│ 3. Text Sanitization (trim, lowercasing)                     │
│ 4. Vectorization: FeatureUnion (Word TF-IDF + Char n-grams)  │
│ 5. Inference: Multi-class LogisticRegression.predict_proba() │
│ 6. Margin Calculation: is_close = (top_prob - 2nd_prob) < 0.1│
└──────────────────────────────┬───────────────────────────────┘
                               │ JSON Response Payload
┌──────────────────────────────▼───────────────────────────────┐
│                    Client UI Updates                         │
│  - Color-coded badge & sentiment card                        │
│  - Confidence model score percentage                         │
│  - Close-prediction banner (if is_close)                     │
│  - Expandable 4-class score breakdown accordion              │
│  - Remaining predictions counter (for anonymous users)       │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Current Dataset & Model State

### Dataset
* **Canonical Foundation Dataset (`data/processed/sentiment_dataset.csv`):** 8,000 cleaned, deduplicated, and normalized service feedback records across 10 industry sectors (800 records each):
  1. Banking & UPI
  2. Cab & Transport
  3. Customer Support
  4. E-Commerce
  5. Education & EdTech
  6. Food Delivery
  7. Grocery Delivery
  8. Healthcare & Consultations
  9. Telecom & Broadband
  10. Travel & Hospitality
* **Production Augmented Training Set (`data/test/phase_6_9_experiment_dataset.csv`):** 8,520 records (8,000 foundation records + 400 targeted generic English sentiment records + 120 targeted Hinglish negation patterns).
* **Frozen Benchmark Challenge Set (`data/test/challenge_dataset.csv`):** 90 manually curated adversarial stress-test cases.

### Production Model Artifacts
* **Classifier (`ml/models/sentiment_final_model.pkl`):** Multi-class `LogisticRegression(max_iter=1000, random_state=42)`.
* **Vectorizer (`ml/models/sentiment_final_vectorizer.pkl`):** `sklearn.pipeline.FeatureUnion` generating 34,592 sparse features:
  * **Word TF-IDF:** Word unigrams `(1, 1)`, `min_df=2`, `sublinear_tf=True`.
  * **Character TF-IDF:** Character boundary n-grams `(3, 5)`, `min_df=3`, `sublinear_tf=True`.
* **Model Metadata (`ml/models/final_model_metadata.json`):** Verified configuration and feature metadata.
* *Note: The production model artifacts are strictly frozen and are not modified or retrained at runtime.*

---

## 5. Current Sentiment Classes

The model classifies all input texts into one of four mutually exclusive target sentiments:

1. **`positive`**: Praise, satisfaction, or favorable evaluation.
2. **`negative`**: Complaints, dissatisfaction, service outages, or criticism.
3. **`neutral`**: Factual queries, account inquiries, or non-opinionated statements.
4. **`mixed`**: Statements containing conflicting positive and negative elements (e.g., *"Food was delicious, but delivery was two hours late"*).

During inference, `model.predict_proba()` produces softmax-like probability estimates for each of the four classes. The winning class is selected as `argmax(probabilities)`, and the top probability is returned as the model score.

---

## 6. Current Evaluation Results

The production model achieves high accuracy and balanced multi-class performance:

* **Standard Stratified 80/20 Holdout (1,704 samples):**
  * **Accuracy:** 91.43% (1,558 / 1,704 correct)
  * **Macro F1:** 0.9090
  * **Weighted F1:** 0.9140
  * **Per-Class F1:** Negative: 0.9204 | Positive: 0.9229 | Neutral: 0.9242 | Mixed: 0.8683
* **Strict Unseen-Text Holdout (Group Partitioned, zero lexical overlap):**
  * **Accuracy:** 90.48%
  * **Macro F1:** 0.9022
* **Frozen Adversarial Challenge Benchmark (90 stress-test cases):**
  * **Accuracy:** 75.56% (68 / 90 correct, up from 47.78% in initial baseline)
  * **Macro F1:** 0.7553
  * **Sarcasm Detection:** 100.0% (4/4)
  * **Factual / Neutral:** 100.0% (7/7)
  * **Hinglish Challenge Text:** 73.0% (27/37)
* **Diagnostic Test Cases:**
  * `"I absolutely loved this product."` &rarr; Correctly predicted **`positive`** (Score: 89.5%).
  * Hinglish negation (`"acha nahi laga"`, `"bahut bura tha"`) &rarr; Correctly predicted **`negative`**.

---

## 7. Authentication & Anonymous Usage Limit

The application implements a dual-tier public access and authentication system:

1. **Anonymous Visitors (Low Friction):**
   * Can immediately perform sentiment analysis without creating an account or logging in.
   * Capped at **10 successful predictions per session**, tracked server-side in `request.session['anonymous_prediction_count']`.
   * Invalid inputs (empty strings, 400 Bad Request) do not consume quota.
   * When quota reaches 10, the 11th request is rejected with `HTTP 403 Forbidden` (`error: "free_limit_reached"`).
   * Frontend displays a dedicated `LimitReachedCard` offering direct options to Sign Up or Log In.
2. **Authenticated Users (Unlimited Access):**
   * Users can sign up via `POST /api/auth/signup/` with a unique username and password.
   * Passwords are securely hashed with PBKDF2 with SHA-256 via Django's `create_user()`.
   * Authenticated users have unlimited predictions (no quota enforcement).
   * Session persists across page reloads via Django's secure `sessionid` cookie.
   * Logging out preserves any prior anonymous prediction count so users cannot circumvent the free limit by repeatedly logging in and out.

---

## 8. Current UI Capabilities

* **Design Aesthetics:** Warm copper glassmorphism theme (`#140906` deep espresso background, `#df8758` copper accent, translucent glass panels `bg-[#ebd5c5]/[0.16]` with `backdrop-blur-2xl`).
* **Header:** Leaf brand logo, live anonymous predictions badge, navigation links, and dynamic User/Sign In/Logout controls.
* **Input Panel:**
  * Inset glass textarea with pencil icon and custom copper focus ring.
  * Live character counter and `Ctrl + Enter` / `Cmd + Enter` keyboard shortcut.
  * One-click clickable example prompt.
  * Input reset / clear button.
* **Prediction Result Card:**
  * Icon badge matching sentiment: Check (Positive), Alert (Negative), Minus (Neutral), Scale (Mixed).
  * Confidence score badge formatted as a percentage (`Model score: 85%`).
  * Close Prediction Notice: Rendered dynamically when `isClose: true`.
  * Expandable *Prediction details* accordion showing the complete 4-class probability distribution with colored indicator dots.
  * "Analyze another" button to reset the analyzer.
* **Modals & Overlays:**
  * In-place login and signup forms with real-time field validation and show/hide password toggles.
  * Session-expired banner if session terminates unexpectedly.
* **Motion & Accessibility:**
  * Subtle 0.22s cubic-bezier entrance animation on result rendering.
  * 28s imperceptible ambient background drift.
  * Full `@media (prefers-reduced-motion: reduce)` support disabling all motion for accessibility.
* **Responsive Layout:**
  * Adapts cleanly from full desktop down to small 320px mobile screens without horizontal overflow.

---

## 9. Current API Behavior

| Method | Endpoint | Auth Required | CSRF Required | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/auth/csrf/` | No | No | Establishes `csrftoken` cookie and returns `{ "csrfToken": "..." }`. |
| `GET` | `/api/auth/me/` | No | No | Returns `{ "authenticated": true, "username": "..." }` or `{ "authenticated": false, "free_predictions_remaining": N }`. |
| `POST` | `/api/auth/signup/` | No | Yes | Creates user account, establishes session, returns authenticated profile and rotated CSRF token. |
| `POST` | `/api/auth/login/` | No | Yes | Authenticates credentials, establishes session, returns profile and rotated CSRF token. |
| `POST` | `/api/auth/logout/` | No | Yes | Logs out current user, preserves anonymous counter, returns success status and fresh token. |
| `POST` | `/api/predict/` | Quota-based | Yes | Predicts sentiment for input text. Returns `sentiment`, `score`, `scores`, `is_close`, and `free_predictions_remaining` (for anonymous users). |

---

## 10. Current Security Measures

1. **Session-Based Authentication:** Standard Django sessions stored in database and tracked using HTTP-only `sessionid` cookies.
2. **CSRF Protection:** Custom `CsrfEnforcedSessionAuthentication` enforces valid CSRF tokens on all state-changing API endpoints (`POST`).
3. **CSRF Rotation:** Tokens are rotated on login and signup to prevent session-fixation attacks, with the new token returned to update client state immediately.
4. **Trusted Origins:** Development origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://[::1]:5173`, port 8000, port 5174) declared in `CSRF_TRUSTED_ORIGINS`.
5. **Password Security:** PBKDF2 with SHA-256 password hashing. Passwords are never returned in responses.
6. **Server-Side Quota Enforcement:** Anonymous limits are managed entirely on the server; tampering with client state cannot bypass the quota.
7. **Input Validation:** Rejects empty or whitespace-only strings with `400 Bad Request`.

---

## 11. Known Limitations

1. **Ultra-Short Statements:** Extremely short inputs (1–2 words like *"fine"* or *"ok"*) lack syntactic context and may result in low confidence or close predictions.
2. **Complex Negation Over Long Spans:** Sentences with positive keywords separated from negation by multiple clauses may occasionally lean toward the positive unigram weights.
3. **Subtle Irony / Sarcasm:** Deep, culturally specific, or non-lexical irony without overt polarity clash may be misclassified by classical bag-of-words models.
4. **Classical Linear Model Architecture:** Does not utilize deep contextual transformer representations (e.g., BERT, RoBERTa); limited to sublinear TF-IDF features.
5. **Development Server Configuration:** Uses SQLite and Django development server (`runserver`), suitable for academic presentation but not scaled production.

---

## 12. What Is Intentionally Not Implemented

* **No Social OAuth:** Third-party OAuth (Google, GitHub) is omitted in favor of simple, explainable built-in Django session authentication.
* **No External Email Server:** Password resets and user verification emails are routed through Django's console email backend.
* **No Heavy Transformer Models:** Transformer-based LLMs (e.g. BERT/T5) were excluded to maintain fast, low-latency, CPU-only inference without GPU requirements.
* **No Complex Role-Based Access Control (RBAC):** Binary access model (anonymous 10-quota vs. authenticated unlimited) without administrative tiers or billing systems.
* **No Asynchronous Task Queues:** Celery and Redis were excluded because inference latency is $< 15\text{ms}$ synchronously.
