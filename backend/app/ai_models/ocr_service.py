"""
OCR Service
===========
Extracts text from uploaded images using EasyOCR with OpenCV preprocessing.
Falls back gracefully if EasyOCR is unavailable.
"""

import logging
import re
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

_reader = None
_easyocr_available = False


def _get_reader():
    global _reader, _easyocr_available
    if _reader is None:
        try:
            import easyocr
            _reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            _easyocr_available = True
            logger.info("EasyOCR reader initialised")
        except Exception as e:
            logger.warning(f"EasyOCR not available: {e}")
            _easyocr_available = False
    return _reader, _easyocr_available


def _preprocess_image(image_path: str):
    """Apply preprocessing to improve OCR accuracy."""
    try:
        import cv2
        img = cv2.imread(image_path)
        if img is None:
            return None
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Noise reduction
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        # Adaptive thresholding for better text separation
        thresh = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return thresh
    except Exception as e:
        logger.warning(f"Image preprocessing error: {e}")
        return None


def extract_text(image_path: str) -> dict:
    """
    Extract text from an image file.
    Returns:
        {
          'text': str,
          'confidence': float | None,
          'method': str,
          'error': str | None,
          'urls': list[str]
        }
    """
    path = Path(image_path)
    if not path.exists():
        return {
            'text': '',
            'confidence': None,
            'method': 'error',
            'error': 'Image file not found',
            'urls': []
        }

    reader, available = _get_reader()

    if not available:
        # Try PIL-based fallback
        try:
            from PIL import Image
            img = Image.open(image_path)
            # PIL alone cannot OCR — return error with guidance
            return {
                'text': '',
                'confidence': None,
                'method': 'unavailable',
                'error': (
                    'EasyOCR is not installed. '
                    'Install it with: pip install easyocr'
                ),
                'urls': []
            }
        except Exception as e:
            return {
                'text': '',
                'confidence': None,
                'method': 'error',
                'error': str(e),
                'urls': []
            }

    try:
        results = reader.readtext(image_path, detail=1, paragraph=False)
        if not results:
            return {
                'text': '',
                'confidence': 0.0,
                'method': 'easyocr',
                'error': None,
                'urls': []
            }

        lines = []
        confidences = []
        for (bbox, text, conf) in results:
            if conf > 0.1:  # discard very-low-confidence detections
                lines.append(text)
                confidences.append(conf)

        full_text = ' '.join(lines)
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0

        # Extract URLs from OCR text
        urls = re.findall(r'https?://\S+|www\.\S+', full_text)

        return {
            'text': full_text.strip(),
            'confidence': round(avg_confidence * 100, 1),
            'method': 'easyocr',
            'error': None,
            'urls': urls
        }
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        return {
            'text': '',
            'confidence': None,
            'method': 'error',
            'error': str(e),
            'urls': []
        }
