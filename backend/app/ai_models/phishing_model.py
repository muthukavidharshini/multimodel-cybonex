"""
Phishing Detection Model
========================
Analyzes URLs and email/SMS text for phishing indicators.

URL Model: Random Forest trained on URL-based features.
  Recommended dataset: PhiUSIIL / UCI Phishing Websites Dataset
  https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset

Text Model: TF-IDF + Logistic Regression on email body text.
  Recommended dataset: Nazario Phishing Email Corpus or Enron + Phishing

Falls back to rule-based heuristics if models are absent.
"""

import re
import os
import math
import logging
import joblib
import numpy as np
from pathlib import Path
from urllib.parse import urlparse

try:
    import tldextract
    HAS_TLDEXTRACT = True
except ImportError:
    HAS_TLDEXTRACT = False

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent / 'trained_models'
URL_MODEL_PATH = MODEL_DIR / 'phishing_url_classifier.joblib'
URL_SCALER_PATH = MODEL_DIR / 'phishing_url_scaler.joblib'
TEXT_MODEL_PATH = MODEL_DIR / 'phishing_text_classifier.joblib'
TEXT_VEC_PATH = MODEL_DIR / 'phishing_text_vectorizer.joblib'

URGENT_PHRASES = [
    'verify your account', 'update your information', 'suspended account',
    'confirm your identity', 'click here immediately', 'act now',
    'your account will be closed', 'limited time', 'urgent action required',
    'you have won', 'claim your prize', 'otp', 'one time password',
    'enter your password', 'bank details', 'credit card', 'ssn',
    'social security', 'wire transfer', 'gift card', 'send money',
    'dear customer', 'dear user', 'dear valued member'
]

SUSPICIOUS_URL_KEYWORDS = [
    'secure', 'account', 'update', 'confirm', 'verify', 'login',
    'signin', 'bank', 'paypal', 'amazon', 'apple', 'microsoft',
    'google', 'netflix', 'support', 'help', 'password', 'recover'
]

KNOWN_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
    'buff.ly', 'adf.ly', 'tiny.cc', 'rebrand.ly', 'cutt.ly', 'short.io'
]


# ─── URL Feature Extraction ──────────────────────────────────────────────────

def extract_url_features(url: str) -> dict:
    features = {}
    try:
        parsed = urlparse(url if url.startswith('http') else 'http://' + url)
        full = url.lower()

        features['url_length'] = len(url)
        features['domain_length'] = len(parsed.netloc)
        features['path_length'] = len(parsed.path)
        features['has_https'] = int(url.lower().startswith('https://'))
        features['has_ip'] = int(bool(re.match(r'^https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url)))
        features['num_dots'] = url.count('.')
        features['num_hyphens'] = url.count('-')
        features['num_underscores'] = url.count('_')
        features['num_slashes'] = url.count('/')
        features['num_at'] = url.count('@')
        features['num_query_params'] = len(parsed.query.split('&')) if parsed.query else 0
        features['has_suspicious_keywords'] = int(
            any(kw in full for kw in SUSPICIOUS_URL_KEYWORDS))
        features['is_shortened'] = int(
            any(sh in parsed.netloc for sh in KNOWN_SHORTENERS))
        features['has_subdomain'] = int(parsed.netloc.count('.') > 1)
        features['subdomain_count'] = parsed.netloc.count('.')

        # Entropy of domain (high entropy → random-looking domain)
        domain = parsed.netloc.split(':')[0]
        features['domain_entropy'] = _char_entropy(domain)

        # TLD extraction
        if HAS_TLDEXTRACT:
            ext = tldextract.extract(url)
            features['tld_length'] = len(ext.suffix)
            features['has_suspicious_tld'] = int(ext.suffix in [
                'xyz', 'top', 'club', 'online', 'site', 'info', 'biz',
                'tk', 'ml', 'ga', 'cf', 'gq'
            ])
        else:
            features['tld_length'] = 3
            features['has_suspicious_tld'] = 0

        # Digit ratio in domain
        alpha = sum(c.isalpha() for c in domain) or 1
        digit = sum(c.isdigit() for c in domain)
        features['digit_ratio'] = digit / max(len(domain), 1)

    except Exception as e:
        logger.warning(f"URL feature extraction error: {e}")
        features = {k: 0 for k in [
            'url_length', 'domain_length', 'path_length', 'has_https',
            'has_ip', 'num_dots', 'num_hyphens', 'num_underscores',
            'num_slashes', 'num_at', 'num_query_params',
            'has_suspicious_keywords', 'is_shortened', 'has_subdomain',
            'subdomain_count', 'domain_entropy', 'tld_length',
            'has_suspicious_tld', 'digit_ratio'
        ]}

    return features


def _char_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    n = len(s)
    return -sum((v / n) * math.log2(v / n) for v in freq.values())


# ─── URL Heuristic Score ─────────────────────────────────────────────────────

def _heuristic_url_score(features: dict, url: str) -> tuple[float, list]:
    score = 0
    indicators = []

    if features.get('has_ip'):
        score += 35
        indicators.append('URL uses an IP address instead of a domain name')
    if not features.get('has_https'):
        score += 20
        indicators.append('URL does not use HTTPS — connection is not encrypted')
    if features.get('is_shortened'):
        score += 20
        indicators.append('Shortened URL detected — destination is hidden')
    if features.get('url_length', 0) > 100:
        score += 15
        indicators.append('Unusually long URL')
    if features.get('num_hyphens', 0) > 3:
        score += 10
        indicators.append('Multiple hyphens in domain — common phishing pattern')
    if features.get('num_at', 0) > 0:
        score += 25
        indicators.append('@ symbol in URL — can redirect to malicious host')
    if features.get('domain_entropy', 0) > 3.8:
        score += 15
        indicators.append('Domain has high character randomness — may be generated')
    if features.get('has_suspicious_tld', 0):
        score += 20
        indicators.append('Suspicious top-level domain (e.g., .xyz, .tk, .ml)')
    if features.get('has_suspicious_keywords', 0):
        score += 10
        indicators.append('Phishing keywords found in URL path')
    if features.get('subdomain_count', 0) > 3:
        score += 10
        indicators.append('Excessive subdomains in URL')

    return min(score, 100), indicators


# ─── Text Heuristic Score ────────────────────────────────────────────────────

def _heuristic_text_score(text: str) -> tuple[float, list]:
    text_lower = text.lower()
    score = 0
    indicators = []

    found_urgent = [p for p in URGENT_PHRASES if p in text_lower]
    if found_urgent:
        score += min(len(found_urgent) * 10, 50)
        indicators.append(f"Urgency or sensitive-data language: {', '.join(found_urgent[:4])}")

    # Look for embedded URLs
    urls = re.findall(r'https?://\S+', text)
    if urls:
        for url in urls[:3]:
            f = extract_url_features(url)
            url_score, url_ind = _heuristic_url_score(f, url)
            if url_score > 40:
                score += 15
                indicators.append(f"Suspicious link in message: {url[:60]}")
                indicators.extend(url_ind[:2])
                break

    # Generic greeting (phishing often uses impersonal greetings)
    if re.search(r'\bdear (customer|user|member|sir|ma\'?am)\b', text_lower):
        score += 10
        indicators.append('Generic impersonal greeting detected')

    # Request for credentials
    if re.search(r'\b(password|pin|otp|cvv|ssn|social security|bank account)\b', text_lower):
        score += 20
        indicators.append('Request for sensitive credentials or financial information')

    return min(score, 100), indicators


# ─── ML Loaders ─────────────────────────────────────────────────────────────

def _load_url_model():
    if URL_MODEL_PATH.exists() and URL_SCALER_PATH.exists():
        try:
            return joblib.load(URL_MODEL_PATH), joblib.load(URL_SCALER_PATH)
        except Exception as e:
            logger.warning(f"URL model load error: {e}")
    return None, None


def _load_text_model():
    if TEXT_MODEL_PATH.exists() and TEXT_VEC_PATH.exists():
        try:
            return joblib.load(TEXT_MODEL_PATH), joblib.load(TEXT_VEC_PATH)
        except Exception as e:
            logger.warning(f"Text phishing model load error: {e}")
    return None, None


# ─── Public API ──────────────────────────────────────────────────────────────

def analyze_url(url: str) -> dict:
    features = extract_url_features(url)
    clf, scaler = _load_url_model()

    if clf is not None and scaler is not None:
        try:
            feat_vector = np.array(list(features.values())).reshape(1, -1)
            feat_scaled = scaler.transform(feat_vector)
            prob = clf.predict_proba(feat_scaled)[0]
            phishing_prob = float(prob[1]) if len(prob) > 1 else float(prob[0])
            risk_score = round(phishing_prob * 100, 1)
            method = 'ml_random_forest'
            note = 'ML-based URL analysis. HTTPS alone does not confirm safety.'
        except Exception as e:
            logger.error(f"URL ML inference error: {e}")
            risk_score, indicators = _heuristic_url_score(features, url)
            phishing_prob = risk_score / 100
            method = 'heuristic'
            note = 'ML inference failed; heuristic fallback used.'
    else:
        risk_score, _ = _heuristic_url_score(features, url)
        phishing_prob = risk_score / 100
        method = 'heuristic'
        note = 'No trained URL model found. Train with train_models.py.'

    _, indicators = _heuristic_url_score(features, url)

    if risk_score >= 65:
        label = 'Likely Phishing'
    elif risk_score >= 35:
        label = 'Suspicious'
    else:
        label = 'Likely Safe'

    return {
        'label': label,
        'risk_score': risk_score,
        'phishing_probability': round(phishing_prob * 100, 1),
        'confidence': round(max(phishing_prob, 1 - phishing_prob) * 100, 1),
        'method': method,
        'url_features': features,
        'suspicious_indicators': indicators,
        'note': note
    }


def analyze_text(text: str) -> dict:
    clf, vec = _load_text_model()
    heuristic_score, heuristic_indicators = _heuristic_text_score(text)

    if clf is not None and vec is not None:
        try:
            features = vec.transform([text])
            prob = clf.predict_proba(features)[0]
            phishing_prob = float(prob[1]) if len(prob) > 1 else float(prob[0])
            risk_score = round(phishing_prob * 100, 1)
            method = 'ml_logistic_regression'
            note = 'ML-based text phishing analysis.'
        except Exception as e:
            logger.error(f"Text ML inference error: {e}")
            risk_score = heuristic_score
            phishing_prob = risk_score / 100
            method = 'heuristic'
            note = 'ML inference failed; heuristic fallback used.'
    else:
        risk_score = heuristic_score
        phishing_prob = risk_score / 100
        method = 'heuristic'
        note = 'No trained text phishing model found. Train with train_models.py.'

    if risk_score >= 65:
        label = 'Likely Phishing'
    elif risk_score >= 35:
        label = 'Suspicious'
    else:
        label = 'Likely Safe'

    return {
        'label': label,
        'risk_score': risk_score,
        'phishing_probability': round(phishing_prob * 100, 1),
        'confidence': round(max(phishing_prob, 1 - phishing_prob) * 100, 1),
        'method': method,
        'suspicious_indicators': heuristic_indicators,
        'note': note
    }
