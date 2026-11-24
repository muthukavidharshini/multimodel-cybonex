from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

from config import config

jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per hour", "50 per minute"])


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    cfg = config.get(config_name, config['default'])
    app.config.from_object(cfg)

    # Ensure upload folder exists (absolute path guaranteed by config)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # CORS — accept configured frontend URLs, localhost, Vercel (*.vercel.app), and Render (*.onrender.com)
    import re
    frontend_env = app.config.get('FRONTEND_URL', 'http://localhost:5173')
    raw_origins = [url.strip().rstrip('/') for url in frontend_env.split(',') if url.strip()]

    # If FRONTEND_URL is set to '*', allow all origins
    if '*' in raw_origins:
        CORS(app,
             resources={r"/api/*": {"origins": "*"}},
             supports_credentials=False,
             allow_headers=['Content-Type', 'Authorization'],
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    else:
        allowed_origins = [
            re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"),
            re.compile(r"^https://.*\.vercel\.app$"),
            re.compile(r"^https://.*\.onrender\.com$")
        ]
        for origin in raw_origins:
            if origin not in allowed_origins:
                allowed_origins.append(origin)

        CORS(app,
             resources={r"/api/*": {"origins": allowed_origins}},
             supports_credentials=True,
             allow_headers=['Content-Type', 'Authorization'],
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

    jwt.init_app(app)
    limiter.init_app(app)

    # JWT error handlers — return JSON instead of HTML
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'success': False, 'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.detect_routes import detect_bp
    from app.routes.history_routes import history_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.report_routes import report_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(detect_bp, url_prefix='/api/detect')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(report_bp, url_prefix='/api/reports')

    @app.route('/api/health')
    def health():
        demo_mode = bool(app.config.get('DEMO_MODE', False))
        if demo_mode:
            db_status = 'bypassed_demo_mode'
        else:
            try:
                from app.models.database import get_db
                get_db()
                db_status = 'connected'
            except Exception:
                db_status = 'disconnected'

        return jsonify({
            'status': 'ok',
            'message': 'Cross-Modal Intelligence API running',
            'demo_mode': demo_mode,
            'database': db_status,
            'storage_mode': 'temporary_demo' if demo_mode else 'mongodb'
        })

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'success': False, 'message': 'Method not allowed'}), 405

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'success': False, 'message': 'File too large. Maximum size is 10 MB'}), 413

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    return app
