"""
Digital Fraud Detection Model
==============================
Text classification of scam/fraud messages using TF-IDF + Random Forest.

Recommended dataset: SMS Spam Collection / Fraud Detection Dataset
  https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset

Falls back to rule-based heuristics when no trained model is present.
"""

import re
import logging
import joblib
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent / 'trained_models'
MODEL_PATH = MODEL_DIR / 'fraud_classifier.joblib'
VECTORIZER_PATH = MODEL_DIR / 'fraud_vectorizer.joblib'

# ─── Category Keyword Patterns ───────────────────────────────────────────────

FRAUD_CATEGORIES = {
    'UPI/Payment Scam': [
        r'\b(upi|gpay|phonepe|paytm|neft|imps|rtgs)\b',
        r'\b(send money|transfer|payment|transaction)\b',
        r'\b(otp|pin|cvv)\b',
        r'\b(kyc|know your customer|account block)\b'
    ],
    'Lottery/Prize Scam': [
        r'\b(won|winner|winning|lottery|prize|jackpot|reward|selected)\b',
        r'\b(claim your|congratulations|lucky draw)\b',
        r'\b(million|lakh|crore)\b.*\b(won|prize|reward)\b'
    ],
    'Job Scam': [
        r'\b(job offer|work from home|part time|earn daily|earning)\b',
        r'\b(hiring|vacancy|recruitment|apply now)\b',
        r'\b(salary|income|per day|per week)\b.*\b(guaranteed|assured)\b'
    ],
    'Investment Scam': [
        r'\b(invest|investment|returns|profit|double your money)\b',
        r'\b(100%|guaranteed return|no risk|risk free)\b',
        r'\b(crypto|bitcoin|forex|trading)\b.*\b(profit|earn|return)\b'
    ],
    'Shopping Scam': [
        r'\b(free iphone|free samsung|free gift|free product)\b',
        r'\b(limited stock|only \d+ left|flash sale)\b',
        r'\b(order.*cash on delivery|cod.*advance)\b'
    ],
    'Impersonation Scam': [
        r'\b(bank official|rbi|sebi|income tax|government|police)\b',
        r'\b(your account|your card|suspended|blocked|frozen)\b',
        r'\b(verify immediately|call immediately|urgent call)\b'
    ],
    'Loan Scam': [
        r'\b(instant loan|pre-approved loan|loan offer|easy loan)\b',
        r'\b(no documents|without documents|processing fee)\b',
        r'\b(low interest|0% interest|cheap loan)\b'
    ]
}

GENERIC_FRAUD_SIGNALS = [
    r'\b(urgent|immediately|act now|limited time|expire today)\b',
    r'\b(click here|tap here|visit now|download now)\b',
    r'\b(do not share|never share).*\b(otp|pin|password)\b',
    r'\b(free|win|won|prize|gift)\b',
    r'\b(congratulations|congrats)\b',
    r'\b(advance|registration fee|processing fee)\b.*\b(pay|send)\b',
    r'\b(whatsapp|telegram).*\b(contact|message|join)\b'
]


def _detect_category(text: str) -> tuple[str, list]:
    """Return best-matching fraud category and matched patterns."""
    text_lower = text.lower()
    category_scores = {}
    category_matches = {}

    for category, patterns in FRAUD_CATEGORIES.items():
        matches = []
        for pattern in patterns:
            if re.search(pattern, text_lower):
                matches.append(pattern)
        if matches:
            category_scores[category] = len(matches)
            category_matches[category] = matches

    if not category_scores:
        return 'Unknown', []

    best = max(category_scores, key=category_scores.get)
    return best, category_matches[best]


def _heuristic_analysis(text: str) -> dict:
    text_lower = text.lower()
    score = 0
    indicators = []

    # Generic fraud signals
    found_generic = []
    for pattern in GENERIC_FRAUD_SIGNALS:
        if re.search(pattern, text_lower):
            found_generic.append(pattern)
    if found_generic:
        score += min(len(found_generic) * 12, 55)
        indicators.append(f"Fraud signal patterns detected ({len(found_generic)} matched)")

    # Category detection
    category, cat_matches = _detect_category(text)
    if category != 'Unknown':
        score += 20
        indicators.append(f"Content matches {category} pattern")

    # Urgency + monetary combination
    has_urgency = bool(re.search(r'\b(urgent|immediately|now|today|expire)\b', text_lower))
    has_money = bool(re.search(r'\b(money|rupee|rs\.|₹|\$|usd|inr|cash|payment)\b', text_lower))
    if has_urgency and has_money:
        score += 15
        indicators.append('Combination of urgency and monetary request detected')

    # Phone number pattern + request
    if re.search(r'\b\d{10,12}\b', text) and re.search(r'\b(call|contact|whatsapp)\b', text_lower):
        score += 10
        indicators.append('Contains phone number with contact request')

    # Unusual links
    urls = re.findall(r'https?://\S+|www\.\S+', text_lower)
    if urls:
        score += 8
        indicators.append(f"Contains {len(urls)} URL(s)")

    score = min(score, 100)

    if score >= 65:
        label = 'Likely Fraud'
    elif score >= 35:
        label = 'Suspicious'
    else:
        label = 'Likely Legitimate'

    return {
        'label': label,
        'risk_score': score,
        'fraud_probability': round(score, 1),
        'confidence': None,
        'fraud_category': category,
        'method': 'heuristic',
        'suspicious_indicators': indicators,
        'note': (
            'No trained fraud model found. Using linguistic heuristics. '
            'Train the model using train_models.py with a labeled scam dataset.'
        )
    }


def _load_model():
    if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
        try:
            return joblib.load(MODEL_PATH), joblib.load(VECTORIZER_PATH)
        except Exception as e:
            logger.warning(f"Fraud model load error: {e}")
    return None, None


def analyze(text: str, transaction_amount=None) -> dict:
    if not text or len(text.strip()) < 5:
        return {
            'label': 'Uncertain',
            'risk_score': 50,
            'fraud_probability': 50,
            'confidence': None,
            'fraud_category': 'Unknown',
            'method': 'error',
            'suspicious_indicators': ['Input text is too short'],
            'note': 'Please provide more text for analysis.'
        }

    clf, vec = _load_model()
    category, _ = _detect_category(text)
    heuristic = _heuristic_analysis(text)

    # Incorporate optional transaction amount risk signals
    amount_val = None
    if transaction_amount not in (None, ''):
        try:
            amount_val = float(transaction_amount)
        except (ValueError, TypeError):
            amount_val = None

    if clf is not None and vec is not None:
        try:
            features = vec.transform([text])
            prob = clf.predict_proba(features)[0]
            fraud_prob = float(prob[1]) if len(prob) > 1 else float(prob[0])
            risk_score = round(fraud_prob * 100, 1)
            indicators = list(heuristic['suspicious_indicators'])
            if amount_val is not None and amount_val >= 50000:
                risk_score = min(100.0, round(risk_score + 10, 1))
                indicators.append(f'High transaction amount flagged ({amount_val:,.0f})')
            if risk_score >= 65:
                label = 'Likely Fraud'
            elif risk_score >= 35:
                label = 'Suspicious'
            else:
                label = 'Likely Legitimate'

            return {
                'label': label,
                'risk_score': risk_score,
                'fraud_probability': round(risk_score, 1),
                'confidence': round(max(fraud_prob, 1 - fraud_prob) * 100, 1),
                'fraud_category': category,
                'method': 'ml_random_forest',
                'suspicious_indicators': indicators,
                'note': 'ML-based fraud detection. Category identification uses rule-based patterns.'
            }
        except Exception as e:
            logger.error(f"Fraud ML inference error: {e}")

    if amount_val is not None and amount_val >= 50000:
        heuristic['risk_score'] = min(100, heuristic['risk_score'] + 12)
        heuristic['fraud_probability'] = round(heuristic['risk_score'], 1)
        heuristic['suspicious_indicators'].append(f'High transaction amount flagged ({amount_val:,.0f})')
        if heuristic['risk_score'] >= 65:
            heuristic['label'] = 'Likely Fraud'
        elif heuristic['risk_score'] >= 35:
            heuristic['label'] = 'Suspicious'
    elif amount_val is not None and amount_val > 0 and heuristic['risk_score'] >= 35:
        heuristic['suspicious_indicators'].append(f'Transaction amount referenced: {amount_val:,.0f}')

    return heuristic
