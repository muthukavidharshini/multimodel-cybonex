import re
import os


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Za-z]', password):
        return False, 'Password must contain at least one letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one number'
    return True, ''


def validate_name(name: str) -> bool:
    return 2 <= len(name.strip()) <= 100


def allowed_image(filename: str) -> bool:
    allowed = {'png', 'jpg', 'jpeg', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def sanitize_text(text: str, max_length: int = 10000) -> str:
    if not text:
        return ''
    # Strip null bytes and control characters (keep newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text[:max_length].strip()


def is_valid_url(url: str) -> bool:
    """
    Returns True for URLs with http:// or https:// scheme.
    Use normalize_url() first to handle www. URLs without scheme.
    """
    if not url:
        return False
    url = url.strip()
    # Accept scheme-prefixed URLs
    pattern = re.compile(
        r'^(?:https?://)'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return bool(pattern.match(url))


def normalize_url(url: str) -> str:
    """Add http:// scheme to URLs that start with www. or have no scheme."""
    url = url.strip()
    if url and not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    return url
