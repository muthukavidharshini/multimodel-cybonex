from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({'success': False, 'message': 'Authentication required', 'error': str(e)}), 401
        return f(*args, **kwargs)
    return decorated


def get_current_user_id() -> str:
    return get_jwt_identity()
