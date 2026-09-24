# Project Overview

## Purpose

A college-level sentiment analysis application that classifies user-provided text
(reviews, comments, feedback) as **positive** or **negative** using machine learning.

The user enters text in a React frontend, it is sent to a Django REST API, and the
backend runs inference using a trained scikit-learn model to return the predicted
sentiment.

## Current Scope

- Single-page web application for real-time sentiment classification.
- Binary classification: **positive** or **negative**.
- Trained on a ~1,000-record movie/product review dataset (tab-separated text + sentiment).
- Logistic Regression model with TF-IDF features.
- No user authentication, no history, no database usage beyond Django defaults.

## Future Direction

The long-term goal is to evolve this into a more capable feedback analysis tool:

```
Raw customer feedback
        ↓
  ML analysis
        ↓
Structured information
        ↓
Useful feedback insights
```

Planned improvements include:

- Multi-class sentiment (positive, negative, neutral, mixed).
- Multi-service datasets (10 service domains × 500 records).
- Richer classification columns (aspect, issue, severity, abuse, etc.).
- Improved ML model and evaluation.
- Better React UI to display structured results.

These will be implemented **gradually, phase by phase**, without breaking the
existing application.

## Technologies Used (Verified)

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React 19, Vite 8, Tailwind CSS 4, Lucide React icons   |
| Backend   | Django 6.1, Django REST Framework                       |
| ML        | scikit-learn (Logistic Regression + TF-IDF), joblib     |
| Language  | Python 3.13, JavaScript (JSX)                           |
| Database  | SQLite (default Django, not actively used by the app)   |
| Data      | CSV files                                               |
| VCS       | Git, GitHub                                             |

## What This Project Is NOT

- Not an enterprise analytics platform.
- Not a microservices architecture.
- Not containerized (no Docker/Kubernetes).
- Not deployed to cloud infrastructure.
- Not using deep learning or large language models.
- Not using a production database.
- Not using MLOps tooling.

The project is intentionally kept **simple and understandable** for a college setting.
