"""
Cross-Modal Intelligence Engine
================================
Routes multi-modal input to relevant detection modules and fuses their scores
using a weighted evidence combination strategy.

Fusion strategy:
  - Each active modality produces a risk_score in [0, 100].
  - Weights are assigned based on modality reliability:
      text_analysis: 1.0
      url_analysis:  1.2  (URL features are highly discriminative)
      ocr_text:      0.8  (OCR may introduce noise)
  - Final score = weighted average of active modality scores.
  - Dominant category is chosen by highest individual score.
  - If fewer than 2 modalities contribute, the result is marked as
    single-modality to avoid overstating cross-modal evidence.
"""

import re
import logging
from typing import Optional

from app.ai_models import fake_news_model, phishing_model, fraud_model

logger = logging.getLogger(__name__)


def analyze(
    text: Optional[str] = None,
    url: Optional[str] = None,
    extracted_text: Optional[str] = None,
    detection_hint: Optional[str] = None  # 'fake_news' | 'phishing' | 'fraud' | None
) -> dict:
    """
    Run cross-modal analysis on any combination of text, URL, and
    OCR-extracted text.

    IMPORTANT: 'text' and 'extracted_text' are distinct modalities:
      - text: user-submitted text (news article, email, SMS)
      - extracted_text: OCR output from an uploaded image

    Do NOT pass the same string as both — that double-counts it in fusion.

    Returns a unified result dict with:
      - final_label
      - risk_score
      - risk_level
      - detection_category (which module was most confident)
      - modality_results (per-modality breakdown)
      - suspicious_indicators (deduplicated union)
      - explanation
      - recommendations
      - is_cross_modal (bool)
    """

    modality_results = {}
    scores_weighted = []
    all_indicators = []

    # Sanitize inputs
    text = text.strip() if text and text.strip() else None
    extracted_text = extracted_text.strip() if extracted_text and extracted_text.strip() else None
    url = url.strip() if url and url.strip() else None

    # Guard against double-counting: if extracted_text is same as text, treat as text only
    if extracted_text and text and extracted_text == text:
        extracted_text = None

    # ── Text Analysis (user-submitted text) ──────────────────────────────────
    if text and len(text) > 10:
        text_results = _analyze_text_all_modules(text, detection_hint)
        modality_results['text'] = text_results
        best_text = max(text_results.values(), key=lambda r: r.get('risk_score', 0))
        scores_weighted.append((best_text['risk_score'], 1.0, best_text['module']))
        all_indicators.extend(best_text.get('suspicious_indicators', []))

    # ── URL Analysis ──────────────────────────────────────────────────────────
    if url:
        url_result = phishing_model.analyze_url(url)
        url_result['module'] = 'phishing'
        modality_results['url'] = url_result
        scores_weighted.append((url_result['risk_score'], 1.2, 'phishing'))
        all_indicators.extend(url_result.get('suspicious_indicators', []))

    # ── OCR Extracted Text (from image — different modality, lower weight) ───
    if extracted_text and len(extracted_text) > 10:
        ocr_results = _analyze_text_all_modules(extracted_text, detection_hint)
        modality_results['ocr_text'] = ocr_results
        best_ocr = max(ocr_results.values(), key=lambda r: r.get('risk_score', 0))
        scores_weighted.append((best_ocr['risk_score'], 0.8, best_ocr['module']))
        all_indicators.extend(best_ocr.get('suspicious_indicators', []))

    # ── Also extract and analyse URLs found inline in any text ───────────────
    source_texts = [t for t in [text, extracted_text] if t]
    analysed_url_set = {url} if url else set()
    for src_text in source_texts:
        inline_urls = re.findall(r'https?://\S+|www\.\S+', src_text)
        for inline_url in inline_urls[:3]:
            clean_url = inline_url.rstrip('.,;)')
            if clean_url not in analysed_url_set:
                analysed_url_set.add(clean_url)
                u_result = phishing_model.analyze_url(clean_url)
                if u_result['risk_score'] > 40:
                    key = f'inline_url_{clean_url[:30]}'
                    modality_results[key] = u_result
                    scores_weighted.append((u_result['risk_score'], 0.8, 'phishing'))
                    all_indicators.extend(u_result.get('suspicious_indicators', [])[:2])

    # ── Fusion ────────────────────────────────────────────────────────────────
    if not scores_weighted:
        return {
            'final_label': 'No Content',
            'risk_score': 0,
            'risk_level': 'Low',
            'detection_category': 'none',
            'modality_results': {},
            'suspicious_indicators': [],
            'explanation': 'No analysable content was provided.',
            'recommendations': ['Please provide text, a URL, or an image with readable text.'],
            'is_cross_modal': False
        }

    total_weight = sum(w for _, w, _ in scores_weighted)
    final_score = sum(s * w for s, w, _ in scores_weighted) / total_weight
    final_score = round(final_score, 1)

    # Determine dominant detection category
    module_max_score = {}
    for score, weight, module in scores_weighted:
        if module not in module_max_score or score > module_max_score[module]:
            module_max_score[module] = score
    detection_category = max(module_max_score, key=module_max_score.get) if module_max_score else 'unknown'

    is_cross_modal = len(scores_weighted) >= 2

    # Risk level
    if final_score >= 65:
        risk_level = 'High'
        final_label = _high_label(detection_category)
    elif final_score >= 35:
        risk_level = 'Medium'
        final_label = _medium_label(detection_category)
    else:
        risk_level = 'Low'
        final_label = 'Likely Safe / Legitimate'

    # Deduplicate indicators
    unique_indicators = list(dict.fromkeys(all_indicators))[:10]

    explanation = _build_explanation(modality_results, final_score, is_cross_modal, detection_category)
    recommendations = _build_recommendations(final_score, detection_category)

    return {
        'final_label': final_label,
        'risk_score': final_score,
        'risk_level': risk_level,
        'detection_category': detection_category,
        'modality_results': modality_results,
        'suspicious_indicators': unique_indicators,
        'explanation': explanation,
        'recommendations': recommendations,
        'is_cross_modal': is_cross_modal,
        'fusion_note': (
            'Scores combined using weighted average across active modalities. '
            'URL evidence weighted 1.2×, text 1.0×, OCR-extracted text 0.8×.'
            if is_cross_modal else
            'Only one modality was analysed. Cross-modal fusion requires multiple input types.'
        )
    }


def _analyze_text_all_modules(text: str, hint: Optional[str]) -> dict:
    results = {}
    modules = ['fake_news', 'phishing', 'fraud'] if hint is None else [hint]

    if 'fake_news' in modules:
        r = fake_news_model.analyze(text)
        r['module'] = 'fake_news'
        results['fake_news'] = r

    if 'phishing' in modules:
        r = phishing_model.analyze_text(text)
        r['module'] = 'phishing'
        results['phishing'] = r

    if 'fraud' in modules:
        r = fraud_model.analyze(text)
        r['module'] = 'fraud'
        results['fraud'] = r

    return results


def _high_label(category: str) -> str:
    labels = {
        'fake_news': 'Likely Fake / Misinformation',
        'phishing': 'Likely Phishing',
        'fraud': 'Likely Digital Fraud'
    }
    return labels.get(category, 'High Risk Content Detected')


def _medium_label(category: str) -> str:
    labels = {
        'fake_news': 'Possibly Misleading',
        'phishing': 'Suspicious Content',
        'fraud': 'Potentially Fraudulent'
    }
    return labels.get(category, 'Suspicious — Requires Caution')


def _build_explanation(modality_results: dict, score: float, is_cross: bool, category: str) -> str:
    parts = []
    if is_cross:
        parts.append(
            f"Cross-modal analysis combined evidence from {len(modality_results)} input modalities."
        )
    else:
        parts.append("Single-modality analysis performed.")

    if score >= 65:
        parts.append(
            f"The combined risk score of {score:.0f}/100 indicates high-risk content "
            f"most consistent with {category.replace('_', ' ')} patterns."
        )
    elif score >= 35:
        parts.append(
            f"The combined risk score of {score:.0f}/100 suggests suspicious content "
            f"that warrants caution. Some indicators align with {category.replace('_', ' ')}."
        )
    else:
        parts.append(
            f"The combined risk score of {score:.0f}/100 suggests relatively low risk. "
            "No strongly suspicious patterns were detected across the analysed modalities."
        )

    return ' '.join(parts)


def _build_recommendations(score: float, category: str) -> list:
    base = []
    if score >= 65:
        base = [
            'Do not click on any links found in this content.',
            'Do not share any personal, financial, or credential information.',
            'Report this content to the relevant authority or platform.',
            'If you believe you have been targeted, contact your bank or cybercrime helpline immediately.'
        ]
        if category == 'phishing':
            base.append('Verify the sender through an independent, trusted channel before responding.')
        elif category == 'fraud':
            base.append('Do not pay any advance fees or registration charges.')
        elif category == 'fake_news':
            base.append('Cross-check with reliable, established news sources before sharing.')
    elif score >= 35:
        base = [
            'Exercise caution with this content.',
            'Verify the source independently before trusting or acting on this content.',
            'Avoid sharing sensitive information until you can confirm authenticity.'
        ]
    else:
        base = [
            'No strong risk signals detected, but always verify sources independently.',
            'Stay cautious about unsolicited messages or offers.'
        ]
    return base
