from flask import Blueprint
from app.controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login', methods=['POST'])(AuthController.login)
auth_bp.route('/demo-login', methods=['POST'])(AuthController.demo_login)
auth_bp.route('/profile', methods=['GET'])(AuthController.profile)
