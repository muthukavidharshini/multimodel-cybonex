from flask import jsonify


def success_response(data=None, message='Success', status_code=200):
    payload = {'success': True, 'message': message}
    if data is not None:
        payload['data'] = data
    return jsonify(payload), status_code


def error_response(message='An error occurred', status_code=400, errors=None):
    payload = {'success': False, 'message': message}
    if errors:
        payload['errors'] = errors
    return jsonify(payload), status_code


def risk_level_from_score(score: float) -> str:
    if score < 35:
        return 'Low'
    elif score < 65:
        return 'Medium'
    else:
        return 'High'
