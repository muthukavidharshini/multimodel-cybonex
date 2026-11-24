import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env from the same directory as this file (backend/)
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_BASE_DIR, '.env'))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'crossmodal-dev-secret-key-fallback')

    # Demo Mode (disables mandatory MongoDB requirement when true)
    DEMO_MODE = os.environ.get('DEMO_MODE', 'false').strip().lower() in ('true', '1', 'yes', 'on')

    # MongoDB
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/crossmodal_db')

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'crossmodal-jwt-secret-fallback')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)))

    # File Upload — always absolute path relative to backend dir
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10 MB
    UPLOAD_FOLDER = os.path.join(_BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

    # CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
