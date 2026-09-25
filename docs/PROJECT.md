# Project Overview

## Purpose

A college-level sentiment analysis application that classifies user-provided text
(reviews, comments, feedback) into four distinct sentiment categories:
**Positive**, **Negative**, **Neutral**, and **Mixed** using classical machine learning.

The user enters text in a modern React frontend, which transmits it to a Django REST
Framework backend. The API cleans the input, vectorizes it using word and character n-grams,
and runs inference via an optimized Logistic Regression classifier to return the predicted
sentiment label.

## Current Scope

- **Real-Time Classification:** Single-page dashboard for instant sentiment evaluation.
- **4-Class Output:** Classifies input text as `Positive`, `Negative`, `Neutral`, or `Mixed`.
- **Bilingual Coverage:** Supports standard English and Romanized Hindi (Hinglish).
- **Service-Domain Dataset:** Ingests and standardizes 8,000 records across 10 consumer service domains.
- **Interpretable ML Pipeline:** Combined Word TF-IDF + Character boundary TF-IDF (`FeatureUnion`) with Multi-class Logistic Regression (`max_iter=1000`, `class_weight=None`).
- **Decoupled Architecture:** Clean client-server separation between a Vite/React frontend and Django REST API.
- **Focused Simplicity:** No unnecessary user authentication, database persistence, or external third-party cloud APIs.

> **Historical Context:** In initial Phase 0, the application started as a simple binary (positive/negative) prototype trained on ~1,000 movie/product reviews with word-only TF-IDF. Through Phases 1–7, it was expanded into a multi-class, multi-domain system resilient to Hinglish and informal customer feedback.

## Project Evolution & Completed Roadmap

The application was enhanced through a disciplined, phased engineering workflow:

```
Phase 0: Repository audit & baseline documentation
   ↓
Phase 1: Project reorganization & directory standardization
   ↓
Phase 2: Ingestion & structural validation of 10 service datasets
   ↓
Phase 3: Deterministic data cleaning pipeline & canonical dataset generation
   ↓
Phase 4: Multi-class baseline model development
   ↓
Phase 5: Controlled ML feature experiments (Exp 3: Word+Char TF-IDF selected)
   ↓
Phase 6: Adversarial challenge testing & targeted dataset expansion (5,000 → 6,000 → 8,000 records)
   ↓
Phase 7: Final end-to-end application testing & frontend 4-class rendering fix
   ↓
Phase 8: Comprehensive documentation & academic preparation
   ↓
Phase 9: GitHub cleanup & release preparation
```

## Technologies Used (Verified)

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React 19, Vite 8, Tailwind CSS 4, Lucide React icons   |
| Backend   | Django 6.1, Django REST Framework 3.16                  |
| ML        | scikit-learn 1.9, pandas 2.2, NumPy 2.2, joblib 1.4     |
| Language  | Python 3.13, JavaScript (JSX)                           |
| Database  | SQLite (default Django configuration; not actively used)|
| Data      | CSV files (Canonical 12-column schema)                  |
| VCS       | Git, GitHub                                             |

## What This Project Is NOT

- Not an enterprise analytics platform.
- Not a microservices architecture.
- Not containerized (no Docker/Kubernetes).
- Not deployed to cloud infrastructure.
- Not using deep learning, transformer models, or large language models (LLMs).
- Not using a production relational database.
- Not using complex MLOps orchestration tooling.

The project is intentionally kept **simple, robust, interpretable, and understandable** for academic evaluation, viva demonstration, and college submission.

