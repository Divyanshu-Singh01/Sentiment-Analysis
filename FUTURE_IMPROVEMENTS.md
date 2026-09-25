# Future Improvements

> **Notice:** The concepts outlined in this document represent potential future enhancements and architectural possibilities. None of these items are implemented in the current production application.

---

## 1. Machine Learning & Model

* **Transformer Fine-Tuning:** Evaluate fine-tuning compact multilingual transformer models (e.g., `distilbert-base-multilingual-cased` or `Muril` for Indian languages) to compare against classical TF-IDF baselines.
* **Ensemble Modeling:** Combine predictions from Logistic Regression, Linear SVM, and a lightweight tree-based model (e.g., LightGBM) via soft voting to improve boundary confidence in close prediction cases.
* **Calibration & Temperature Scaling:** Apply Platt scaling or isotonic regression to calibrate model probabilities for improved posterior uncertainty estimates.
* **Aspect-Based Sentiment Analysis (ABSA):** Expand the classification head to extract sentiments per aspect (e.g., separate scores for *Delivery*, *Quality*, *Price*, and *Support*).

---

## 2. Dataset

* **Dynamic Feedback Collection:** Implement an opt-in review feedback loop where users can flag incorrect predictions, storing corrected samples for periodic retraining.
* **Dialectal & Transliteration Expansion:** Enrich the training set with broader Indian regional language transliterations (e.g., Roman Bengali, Roman Tamil, Roman Marathi) commonly encountered in customer reviews.
* **Automated Data Augmentation:** Use back-translation and EDA (Easy Data Augmentation: synonym replacement, random insertion) to systematically increase minority class representation (`mixed` class).
* **Continuous Drift Monitoring:** Build automated drift detection scripts to measure vocabulary divergence and label shift over time.

---

## 3. UI & Product

* **Batch File Upload:** Allow users to upload `.csv` or `.xlsx` files containing hundreds of reviews to receive downloadable batch predictions and aggregate sentiment charts.
* **Live Sentiment Trend Analytics:** Add an authenticated dashboard with time-series charts showing sentiment trends across different product categories.
* **Copy & Export Results:** Add one-click export buttons (JSON, CSV, PDF summary) for individual analysis results.
* **Theme Customizer:** Provide user toggles between the default warm copper glassmorphism theme and a high-contrast clean light theme.
* **Voice Input Integration:** Integrate the browser Web Speech API for direct speech-to-text review dictation.

---

## 4. Security

* **Rate Limiting & Throttling:** Introduce IP-level and user-level throttling using Django REST Framework's `AnonRateThrottle` and `UserRateThrottle` to prevent denial-of-service abuse.
* **OAuth 2.0 / Social Login:** Add social sign-in providers (Google, GitHub) via `django-allauth` for frictionless user onboarding.
* **Two-Factor Authentication (2FA):** Provide optional TOTP-based 2FA (e.g., Google Authenticator) for authenticated user accounts.
* **Automated Password Reset Flow:** Implement time-sensitive cryptographic password reset tokens sent via transactional email (SendGrid or AWS SES).

---

## 5. Deployment & DevOps

* **Containerization:** Containerize both Django and Vite applications using multi-stage `Dockerfile` definitions and a unified `docker-compose.yml`.
* **Production WSGI Server:** Replace Django's development server with Gunicorn or Uvicorn behind an Nginx reverse proxy.
* **Production Database:** Migrate from SQLite 3 to PostgreSQL with connection pooling.
* **CI/CD Pipeline:** Configure GitHub Actions workflows to automatically run Django unit tests, linter checks, and frontend builds on every pull request.
* **Cloud Hosting:** Deploy the backend on AWS ECS / Render and host the Vite frontend on Cloudflare Pages or Vercel.

---

## 6. Advanced NLP

* **Sarcasm & Irony Attention Heads:** Integrate specialized sarcasm detection modules using contrastive learning to detect sentiment flip markers (*"Great job breaking the app again"*).
* **Code-Mixed Language Identification:** Automatically identify language boundaries (pure English vs. Hinglish vs. Hindi script) prior to vectorization to apply domain-specific tokenizers.
* **Explainability & Attribution:** Implement LIME (Local Interpretable Model-agnostic Explanations) or SHAP (SHapley Additive exPlanations) to highlight which specific words contributed most to positive or negative scoring.
