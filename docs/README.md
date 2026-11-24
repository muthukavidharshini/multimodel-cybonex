# Cross-Modal Intelligence Platform

## A Unified AI Framework for Fake News, Phishing and Digital Fraud Detection

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** (local or Atlas)

---

## Installation

### 1. Clone / Download the project

```
project/
  frontend/
  backend/
  docs/
  .env.example
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Download NLTK data (one-time)
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

# Copy environment file
copy ..\\.env.example .env    # Windows
# cp ../.env.example .env     # Linux/Mac

# Edit .env — set MONGO_URI and secret keys
```

### 3. Train ML Models (optional but recommended)

Place datasets in `backend/datasets/`:

| File | Dataset | Source |
|------|---------|--------|
| `fake_news.csv` | WELFake / ISOT | [Kaggle](https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification) |
| `phishing_urls.csv` | PhiUSIIL | [UCI](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset) |
| `fraud_sms.csv` | SMS Spam Collection | [Kaggle](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset) |

Required columns:
- `fake_news.csv`: `text`, `label` (0=Fake, 1=Real)
- `phishing_urls.csv`: `url`, `label` (0=Legitimate, 1=Phishing)
- `fraud_sms.csv`: `text`/`v2`, `label`/`v1` (ham/spam or 0/1)

```bash
cd backend
python train_models.py --all
```

> If datasets are not available, the system automatically falls back to heuristic-only analysis. All predictions clearly indicate the analysis method used.

### 4. Start Backend

```bash
cd backend
python run.py
# Server starts on http://localhost:5000
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Configuration

Edit `backend/.env`:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
MONGO_URI=mongodb://localhost:27017/crossmodal_db
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/detect/fake-news` | Fake news analysis |
| POST | `/api/detect/phishing` | Phishing detection |
| POST | `/api/detect/digital-fraud` | Fraud detection |
| POST | `/api/detect/cross-modal` | Cross-modal analysis |
| POST | `/api/detect/image` | Image OCR + analysis |
| GET | `/api/history/` | Get analysis history |
| GET | `/api/history/:id` | Get single analysis |
| DELETE | `/api/history/:id` | Delete analysis |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/reports/:id/pdf` | Download PDF report |

---

## Project Structure

```
backend/
  app/
    ai_models/       # ML models + OCR + cross-modal engine
    controllers/     # Request handlers
    middleware/      # JWT auth
    models/          # MongoDB models
    routes/          # Flask blueprints
    utils/           # Validators, response helpers
  datasets/          # Place training datasets here
  trained_models/    # Saved model files (after training)
  train_models.py    # Model training script
  run.py             # App entry point

frontend/
  src/
    components/      # Reusable UI components
    hooks/           # useAuth context
    layouts/         # DashboardLayout
    pages/           # All 13 pages
    services/        # Axios API client
```

---

## Features

- **Fake News Detection** — TF-IDF + Logistic Regression, linguistic heuristics
- **Phishing Detection** — Random Forest on 19 URL features + text analysis
- **Digital Fraud Detection** — Random Forest + 7-category pattern matching
- **Cross-Modal Engine** — Weighted score fusion across text, URL, OCR modalities
- **Image OCR Analysis** — EasyOCR + OpenCV preprocessing
- **Explainable AI** — Feature importance, suspicious indicators per prediction
- **PDF Reports** — Downloadable analysis reports via ReportLab
- **JWT Authentication** — Secure per-user analysis history
- **Dashboard Analytics** — Charts, stats, recent activity

---

## Limitations

- Predictions are based on ML pattern analysis, not factual verification
- HTTPS alone does not indicate a safe URL
- Accuracy depends on training dataset quality
- Heuristic fallback is used when trained models are absent

---

*Final-year engineering project — for educational and demonstration purposes.*
