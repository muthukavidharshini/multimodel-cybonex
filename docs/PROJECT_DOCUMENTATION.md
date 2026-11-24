# Cross-Modal Intelligence Platform
## Project Documentation

---

## 1. Abstract

This project presents a unified AI-powered cybersecurity platform that detects three major digital threats: fake news, phishing, and digital fraud. The core innovation is a Cross-Modal Intelligence Engine that fuses evidence from multiple input modalities — text, URLs, and OCR-extracted image content — using a weighted score combination strategy. The system is built with React.js (frontend), Flask (backend), MongoDB (database), and scikit-learn (ML), with EasyOCR for image text extraction.

---

## 2. Introduction

The proliferation of digital communication has created new vectors for misinformation, social engineering, and financial fraud. Existing detection tools address these problems in isolation. This project proposes a unified framework that routes input across relevant detection modules and combines their outputs into a single, explainable risk assessment.

---

## 3. Problem Statement

- Fake news spreads rapidly on social media and causes real harm
- Phishing attacks increasingly use sophisticated URLs and social engineering
- Digital fraud messages exploit urgency and impersonation
- No unified system addresses all three threats with multi-modal input support

---

## 4. Proposed System

A three-module detection platform with a cross-modal fusion engine:

| Module | Input | ML Method |
|--------|-------|-----------|
| Fake News | Article text, URL path | TF-IDF + Logistic Regression |
| Phishing | URL, email/SMS text | Random Forest (URL features), LR (text) |
| Digital Fraud | SMS/message text | Random Forest + TF-IDF |
| Cross-Modal | Text + URL + OCR | Weighted score fusion |
| Image Analysis | JPG/PNG screenshots | EasyOCR + OpenCV → detection modules |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│   Landing · Auth · Dashboard · Detection Pages · History │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼────────────────────────────────┐
│                   Flask Backend                          │
│  Auth Routes │ Detect Routes │ History │ Dashboard │ PDF │
└────────────────────────┬────────────────────────────────┘
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ Fake News   │  │  Phishing    │  │    Fraud     │
│ Model       │  │  Model       │  │   Model      │
│ TF-IDF+LR   │  │  RF+features │  │  RF+TF-IDF   │
└──────┬──────┘  └───────┬──────┘  └───────┬──────┘
       └─────────────────┼──────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Cross-Modal Engine │
              │  Weighted Fusion    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     MongoDB         │
              │  users · history    │
              │  model_results      │
              └─────────────────────┘
```

---

## 6. Module Descriptions

### 6.1 Fake News Detection

**Input:** Article text or URL path  
**Features:** TF-IDF unigrams + bigrams (up to 50,000 features)  
**Model:** Logistic Regression (class_weight=balanced)  
**Heuristics:** Sensational vocabulary, excessive capitalisation, clickbait patterns, credibility markers  
**Output:** Likely Real / Uncertain / Likely Fake + risk score + top predictive terms

### 6.2 Phishing Detection

**URL Model:**  
19 extracted features: URL length, domain entropy, HTTPS status, IP address usage, shortened URL detection, suspicious TLD, subdomain count, @ symbol, digit ratio, keyword presence  
**Model:** Random Forest (n=100, balanced)

**Text Model:**  
TF-IDF + Logistic Regression on email/SMS body  
**Heuristics:** Urgency phrases, credential requests, generic greetings, embedded URLs

### 6.3 Digital Fraud Detection

**Input:** SMS/message text  
**Features:** TF-IDF on message content  
**Model:** Random Forest  
**Category detection:** 7-category rule-based pattern matching using regex  
**Categories:** UPI/Payment, Job, Lottery/Prize, Online Shopping, Investment, Impersonation, Loan

### 6.4 Cross-Modal Intelligence Engine

**Strategy:** Weighted average fusion  
- URL analysis: weight 1.2  
- Text analysis: weight 1.0  
- OCR-extracted text: weight 0.8  

**Routing:** Only modalities present in the input contribute to the final score. Missing modalities are excluded entirely.

**Output:** Final risk score = Σ(score_i × weight_i) / Σ(weight_i)

### 6.5 OCR Image Analysis

1. EasyOCR reads image with detail=1
2. OpenCV adaptive thresholding pre-processes
3. Low-confidence detections (< 10%) discarded
4. Extracted text and URLs passed to cross-modal engine

---

## 7. Database Design

### Users Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique, indexed),
  "password_hash": String (bcrypt),
  "created_at": Date
}
```

### Analysis History Collection
```json
{
  "_id": ObjectId,
  "user_id": String (indexed),
  "input_type": String,
  "input_content": String (capped at 2000 chars),
  "detection_module": String,
  "prediction": String,
  "risk_score": Number,
  "risk_level": String,
  "confidence": Number | null,
  "fraud_category": String | null,
  "suspicious_indicators": Array,
  "explanation": String,
  "recommendations": Array,
  "modality_results": Object,
  "extracted_text": String,
  "created_at": Date (indexed)
}
```

### Model Results Collection
```json
{
  "_id": ObjectId,
  "analysis_id": String (indexed),
  "model_name": String,
  "model_version": String,
  "prediction": String,
  "model_score": Number,
  "extracted_features": Object,
  "created_at": Date
}
```

---

## 8. Algorithms

| Algorithm | Use Case | Library |
|-----------|----------|---------|
| TF-IDF | Feature extraction from text | scikit-learn |
| Logistic Regression | Fake news, phishing text | scikit-learn |
| Random Forest | Phishing URL, fraud detection | scikit-learn |
| Entropy (Shannon) | URL randomness scoring | math |
| Adaptive Thresholding | OCR pre-processing | OpenCV |
| Weighted Average | Cross-modal fusion | custom |

---

## 9. Security Measures

- Passwords hashed with bcrypt (salt rounds = 12)
- JWT tokens with configurable expiry (default 24h)
- File upload validation (type + size)
- Input sanitisation (null bytes, length cap)
- Per-user data isolation (user_id on all queries)
- Rate limiting on API endpoints
- Uploaded files deleted after processing

---

## 10. Limitations

- Pattern-based classification does not constitute factual verification
- Model accuracy is bounded by training data quality and coverage
- HTTPS does not guarantee URL safety
- EasyOCR may miss text in low-contrast or rotated images
- No real-time threat intelligence integration
- Cross-modal fusion requires at least one valid modality

---

## 11. Future Enhancements

- Integration with threat intelligence feeds (VirusTotal, Google Safe Browsing API)
- BERT-based language model for improved text classification
- Browser extension for real-time URL scanning
- Video and audio deepfake detection module
- Federated learning for privacy-preserving model updates
- Multi-language support

---

## 12. References

1. Ahmed H., et al. "Detecting opinion spams and fake news using text classification." 2017.
2. Vosoughi, S., Roy, D., Aral, S. "The spread of true and false news online." Science, 2018.
3. PhiUSIIL Phishing URL Dataset. UCI ML Repository. https://archive.ics.uci.edu/dataset/967
4. SMS Spam Collection Dataset. UCI ML Repository. https://archive.ics.uci.edu/dataset/228
5. EasyOCR. JaidedAI. https://github.com/JaidedAI/EasyOCR
6. scikit-learn: Machine Learning in Python. JMLR 12, pp. 2825–2830, 2011.
