# Implementation Plan

## Execution Status Summary (Current State)

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | Project Understanding & Initial Architecture Documentation | ✅ Complete |
| **Phase 1** | Project Reorganization & Directory Standardization | ✅ Complete |
| **Phase 2** | Dataset Ingestion & Schema Validation | ✅ Complete |
| **Phase 3** | Deterministic Dataset Cleaning & Canonical Ingestion Pipeline | ✅ Complete |
| **Phase 4** | Multi-Class Baseline Model Training & Diagnostic Evaluation | ✅ Complete |
| **Phase 5** | Controlled Feature Experiments (Exp 3: Word+Char TF-IDF Selected) | ✅ Complete |
| **Phase 6** | Challenge Testing & Iterative Targeted Dataset Expansion (6.1–6.7) | ✅ Complete |
| **Phase 7** | Final Application Testing, Backend API Verification & Frontend Bug Fix | ✅ Complete |
| **Phase 8** | Final Project Documentation (`README.md`, docs sync, implementation frozen) | ✅ Complete |
| **Phase 9** | GitHub Cleanup & Release Preparation | ⏳ Next Phase |

---

## Original Phased Roadmap Overview


## Phase 0 — Project Understanding & Documentation

**Objective:** Inspect the existing project and create comprehensive documentation
of the current state, architecture, data flow, dataset design, and improvement plan.

**What it does:**
- Inspects every file and directory in the repository.
- Documents the actual current architecture and data flow.
- Documents the dataset design and column structure.
- Documents differences between current state and planned design.
- Creates all documentation files in `docs/`.

**What it does NOT do:**
- Does not modify any existing code.
- Does not move, rename, or delete any files.
- Does not install dependencies.
- Does not change the ML model, Django API, or React UI.

**Dependencies:** None (first phase).

---

## Phase 1 — Project Organization

**Objective:** Organize the project structure so files are in consistent,
logical locations, separating raw datasets, ML code, and Django backend without
breaking existing functionality.

**What it does:**
- Resolves the `model/` vs `ml/` directory inconsistency by establishing `ml/models/`.
- Separates ML code from Django into `ml/` (`preprocessing/`, `training/`, `evaluation/`).
- Organizes raw datasets into separate service folders under `data/raw/<service>/`.
- Creates an empty `data/processed/` directory ready for future combined data.
- Adds a root `.gitignore` (for `venv/`, `__pycache__/`, `*.pyc`, `db.sqlite3`, etc.).
- Adds `requirements.txt` documenting Python dependencies.
- Removes dead `sentiment` app from `INSTALLED_APPS` in Django.
- Fixes model loading in `analyzer/views.py` so the Django API runs cleanly.

**What it does NOT do:**
- Does not change application functionality.
- Does not modify ML model weights or prediction logic.
- Does not modify the React UI.
- Does not alter raw dataset contents.

**Dependencies:** Phase 0 (documentation must exist first).

---

## Phase 2 — Dataset Integration and Validation

**Objective:** Integrate the 10 new service datasets into the project properly
and validate their structure and content.

**What it does:**
- Validates all 10 CSV files (column names, data types, allowed values).
- Checks for missing values, duplicates, or formatting issues.
- Creates validation scripts/reports.
- Documents any data quality issues found.

**What it does NOT do:**
- Does not modify the raw dataset files.
- Does not merge datasets.
- Does not retrain the model.
- Does not change the API or UI.

**Dependencies:** Phase 1.

---

## Phase 3 — Processed Training Dataset

**Objective:** Create a processed, ML-ready training dataset from the 10 raw
service datasets.

**What it does:**
- Combines the 10 raw CSVs into a single processed dataset.
- Applies text cleaning/preprocessing.
- Preserves original service identification.
- Outputs a clean training-ready CSV.

**What it does NOT do:**
- Does not modify the raw dataset files (they remain as-is).
- Does not train the model yet.
- Does not change the API or UI.

**Dependencies:** Phase 2 (datasets must be validated first).

---

## Phase 4 — ML Model Improvement / Retraining

**Objective:** Retrain the ML model on the new, larger processed dataset with
support for multi-class sentiment and richer features.

**What it does:**
- Updates training code to use the new processed dataset.
- Supports multi-class sentiment (positive, negative, neutral, mixed).
- Retrains the Logistic Regression model (or evaluates alternatives).
- Saves new model artifacts.

**What it does NOT do:**
- Does not change the API endpoint contract yet.
- Does not change the React UI.
- Does not introduce deep learning or LLMs.

**Dependencies:** Phase 3 (processed dataset must be ready).

---

## Phase 5 — Model Evaluation

**Objective:** Thoroughly evaluate the retrained model and document its
performance.

**What it does:**
- Runs accuracy, precision, recall, F1 metrics.
- Generates confusion matrix and classification report.
- Compares performance against the old binary model.
- Documents results and identifies weaknesses.

**What it does NOT do:**
- Does not change the API or UI.
- Does not deploy the model.

**Dependencies:** Phase 4 (new model must be trained).

---

## Phase 6 — Django REST Integration

**Objective:** Update the Django API to return richer prediction results using
the new model.

**What it does:**
- Updates `predict_sentiment` to return multi-class sentiment.
- Potentially adds additional fields to the response (aspect, severity, etc.).
- Updates text preprocessing in the API view.
- Ensures backward-compatible or clearly versioned API changes.

**What it does NOT do:**
- Does not change the React UI yet.
- Does not add new endpoints beyond what's needed.

**Dependencies:** Phase 5 (model must be evaluated and approved).

---

## Phase 7 — React UI Improvement

**Objective:** Update the React frontend to display the richer analysis results
from the updated API.

**What it does:**
- Updates `SentimentResult.jsx` to handle multi-class sentiments.
- Displays additional analysis fields (aspect, severity, etc.) if returned.
- Improves the overall UI/UX.

**What it does NOT do:**
- Does not add routing or multiple pages.
- Does not add user authentication.

**Dependencies:** Phase 6 (API must return richer data).

---

## Phase 8 — Structured Analysis Results

**Objective:** Present analysis results in a more structured, informative way.

**What it does:**
- Formats multi-field analysis results clearly.
- Adds visual indicators for severity, abuse level, etc.
- Makes results actionable and easy to understand.

**What it does NOT do:**
- Does not add a database or persistence.
- Does not add user accounts.

**Dependencies:** Phase 7 (UI must support richer results).

---

## Phase 9 — Simple History / Dashboard (If Justified)

**Objective:** Add a simple analysis history or summary dashboard if the
project scope justifies it.

**What it does:**
- Evaluates whether history/dashboard adds value for the project scope.
- If yes, implements simple local or session-based history.
- Possibly adds a basic summary view.

**What it does NOT do:**
- Does not build a full analytics platform.
- Does not add user authentication or multi-tenancy.
- Does not add a production database.

**Dependencies:** Phase 8 (structured results must be complete).

---

## Approval Process

```
Phase N completed
       ↓
  Agent STOPS
       ↓
  Human reviews changes
       ↓
  Human creates Git commit
       ↓
  Human gives explicit approval
       ↓
  Agent begins Phase N+1
```

No phase will be started without explicit human approval.
