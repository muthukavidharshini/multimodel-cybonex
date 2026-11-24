"""
Fake News Detection Model
=========================
Uses TF-IDF + Logistic Regression trained on a labeled dataset.

Dataset: WELFake / ISOT Fake News Dataset
  - https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification
  - Columns: title, text, label  (0 = Fake, 1 = Real)

If the trained model file is not present, the service falls back to a
heuristic-only analysis and clearly marks predictions as "HEURISTIC".
"""

import os
import re
import joblib
import numpy as np
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent / 'trained_models'
MODEL_PATH = MODEL_DIR / 'fake_news_classifier.joblib'
VECTORIZER_PATH = MODEL_DIR / 'fake_news_vectorizer.joblib'

# Linguistic markers commonly found in sensationalist / fake news
SENSATIONAL_WORDS = [
    'shocking', 'bombshell', 'breaking', 'exposed', 'secret', 'conspiracy',
    'mainstream media', 'fake news', 'they don\'t want you to know',
    'wake up', 'share before deleted', 'banned', 'censored', 'miracle cure',
    'you won\'t believe', 'incredible', 'unbelievable', 'must share',
    'government cover', 'big pharma', 'deep state', 'hoax', 'staged',
    'sheeple', 'wake up sheeple', 'read before it\'s deleted',
    'click here', 'make money fast', 'get rich', '100% proven'
]

CREDIBILITY_MARKERS = [
    'according to', 'study shows', 'researchers found', 'published in',
    'spokesperson said', 'official statement', 'data shows', 'report says',
    'confirmed by', 'experts say', 'university', 'institute', 'journal'
]

CLICKBAIT_PATTERNS = [
    r'\b(you won\'t believe|this will shock you|doctors hate)\b',
    r'\b(one weird trick|secret they don\'t)\b',
    r'!\s*!\s*!',   # multiple exclamation marks
    r'\?{2,}',      # multiple question marks
    r'\b(SHARE|REPOST|FORWARD)\b'
]


def _load_model():
    if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
        try:
            clf = joblib.load(MODEL_PATH)
            vec = joblib.load(VECTORIZER_PATH)
            return clf, vec
        except Exception as e:
            logger.warning(f"Could not load fake news model: {e}")
    return None, None


def _heuristic_analysis(text: str) -> dict:
    """
    Rule-based heuristic analysis when no trained model is available.
    Returns a score and indicators — clearly labelled as heuristic.
    """
    text_lower = text.lower()
    words = text_lower.split()
    score = 0
    indicators = []

    # Sensational words
    found_sensational = [w for w in SENSATIONAL_WORDS if w in text_lower]
    if found_sensational:
        score += min(len(found_sensational) * 8, 40)
        indicators.append(f"Sensational language detected: {', '.join(found_sensational[:5])}")

    # Credibility markers
    found_credible = [m for m in CREDIBILITY_MARKERS if m in text_lower]
    if found_credible:
        score -= min(len(found_credible) * 5, 25)

    # Clickbait patterns
    for pattern in CLICKBAIT_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            score += 10
            indicators.append('Clickbait or emotional manipulation pattern detected')
            break

    # Excessive capitalisation
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.25:
        score += 15
        indicators.append('Excessive use of capital letters')

    # Excessive punctuation
    punct_density = (text.count('!') + text.count('?')) / max(len(words), 1)
    if punct_density > 0.15:
        score += 10
        indicators.append('Excessive exclamation or question marks')

    # Very short content
    if len(words) < 20:
        score += 5
        indicators.append('Very short content — limited context for analysis')

    # Clamp
    score = max(0, min(score, 100))

    if score >= 65:
        label = 'Likely Fake'
    elif score >= 35:
        label = 'Uncertain'
    else:
        label = 'Likely Real'

    return {
        'label': label,
        'risk_score': score,
        'confidence': None,  # heuristic has no calibrated confidence
        'method': 'heuristic',
        'suspicious_indicators': indicators,
        'credibility_markers': found_credible if found_credible else [],
        'note': (
            'No trained model found. This result is based on linguistic heuristics only. '
            'Train the model using train_models.py with a labeled dataset for ML-based predictions.'
        )
    }


def analyze(text: str) -> dict:
    """
    Main entry point. Returns analysis dict with label, score, indicators.
    """
    if not text or len(text.strip()) < 10:
        return {
            'label': 'Uncertain',
            'risk_score': 50,
            'confidence': None,
            'method': 'error',
            'suspicious_indicators': ['Input text is too short for meaningful analysis'],
            'credibility_markers': [],
            'note': 'Please provide more text for analysis.'
        }

    clf, vec = _load_model()

    if clf is not None and vec is not None:
        # ML-based prediction
        try:
            features = vec.transform([text])
            prob = clf.predict_proba(features)[0]
            classes = list(clf.classes_)
            # Look up fake class index safely; default to 0 if classes are [0,1]
            fake_idx = classes.index(0) if 0 in classes else 0
            real_idx = classes.index(1) if 1 in classes else 1
            fake_prob = float(prob[fake_idx])
            real_prob = float(prob[real_idx])
            risk_score = round(fake_prob * 100, 1)

            if risk_score >= 65:
                label = 'Likely Fake'
            elif risk_score >= 35:
                label = 'Uncertain'
            else:
                label = 'Likely Real'

            # Feature importance for top words
            indicators = _extract_top_features(vec, clf, text, fake_prob)

            # Supplement with heuristic indicators
            heuristic = _heuristic_analysis(text)
            all_indicators = list(set(indicators + heuristic['suspicious_indicators']))

            return {
                'label': label,
                'risk_score': risk_score,
                'confidence': round(max(fake_prob, real_prob) * 100, 1),
                'method': 'ml_logistic_regression',
                'suspicious_indicators': all_indicators,
                'credibility_markers': heuristic['credibility_markers'],
                'note': 'Prediction based on trained TF-IDF + Logistic Regression model. Style analysis does not constitute factual verification.'
            }
        except Exception as e:
            logger.error(f"ML inference error: {e}")
            # Fall through to heuristic

    return _heuristic_analysis(text)


def _extract_top_features(vectorizer, clf, text: str, fake_prob: float) -> list:
    """Extract top-contributing feature words from the classifier."""
    indicators = []
    try:
        feature_names = vectorizer.get_feature_names_out()
        coef = clf.coef_
        # Determine which coefficient row corresponds to the "fake" class (0)
        classes = list(clf.classes_)
        fake_idx = classes.index(0) if 0 in classes else 0
        if coef.shape[0] == 1:
            # Binary logistic regression stores one row of coefficients
            # Positive coefficients push toward the positive class (index 1 in classes_)
            # If fake=0 is the negative class, negate to get "fake-pushing" contributions
            fake_coef = -coef[0] if fake_idx == 0 else coef[0]
        else:
            fake_coef = coef[fake_idx]

        tfidf_vec = vectorizer.transform([text]).toarray()[0]
        contributions = tfidf_vec * fake_coef
        top_indices = np.argsort(contributions)[-8:][::-1]
        top_words = [feature_names[i] for i in top_indices if contributions[i] > 0.001]
        if top_words:
            indicators.append(f"Key predictive terms: {', '.join(top_words[:6])}")
    except Exception:
        pass
    return indicators
