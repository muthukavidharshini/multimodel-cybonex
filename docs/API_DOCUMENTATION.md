# API Documentation

## Base URL

```
http://localhost:5000/api
```

All protected endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication

### POST /auth/register

Register a new user.

**Request body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password1"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Alice", "email": "alice@example.com" }
  }
}
```

---

### POST /auth/login

**Request body:**
```json
{ "email": "alice@example.com", "password": "password1" }
```

**Response 200:**
```json
{
  "success": true,
  "data": { "token": "<jwt>", "user": { ... } }
}
```

---

### GET /auth/profile *(protected)*

Returns the authenticated user's profile.

---

## Detection Endpoints

All detection endpoints are protected and return a consistent structure:

```json
{
  "success": true,
  "data": {
    "analysis_id": "...",
    "prediction": "Likely Fake",
    "risk_score": 72.5,
    "risk_level": "High",
    "confidence": 85.2,
    "suspicious_indicators": ["..."],
    "explanation": "...",
    "recommendations": ["..."],
    "method": "ml_logistic_regression | heuristic"
  }
}
```

### POST /detect/fake-news

**Body (text mode):**
```json
{ "text": "Article content here..." }
```

**Body (URL mode):**
```json
{ "url": "https://example.com/article" }
```

---

### POST /detect/phishing

```json
{
  "url": "https://suspicious-site.tk/verify",
  "text": "Dear customer, your account will be suspended..."
}
```

At least one field required.

---

### POST /detect/digital-fraud

```json
{ "text": "Congratulations! You won ₹10 lakh. Pay ₹500 to claim." }
```

---

### POST /detect/cross-modal

```json
{
  "text": "...",
  "url": "...",
  "detection_hint": "phishing"
}
```

`detection_hint` is optional: `fake_news | phishing | fraud`

---

### POST /detect/image

Multipart form upload. Field name: `image`.

Supported types: JPG, JPEG, PNG, WEBP. Max 10 MB.

---

## History

### GET /history/

Query params: `limit` (max 100, default 20), `skip` (default 0)

### GET /history/:id

Returns full analysis record.

### DELETE /history/:id

Deletes the record. Only the owning user can delete.

---

## Dashboard

### GET /dashboard/stats

Returns:
```json
{
  "stats": { "total": 42, "fake_news": 10, "phishing": 15, "digital_fraud": 12, "cross_modal": 5, "high_risk": 8 },
  "weekly_activity": [{ "_id": "2026-11-08", "count": 3 }, ...],
  "recent_analyses": [...],
  "user": { "name": "Alice", "email": "..." }
}
```

---

## Reports

### GET /reports/:id/pdf *(protected)*

Downloads a PDF report for the given analysis. Requires `reportlab`.

---

## Error Responses

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Common status codes:
- `400` — Bad input
- `401` — Not authenticated
- `404` — Not found
- `409` — Conflict (duplicate email)
- `500` — Server error
- `503` — Database unavailable
