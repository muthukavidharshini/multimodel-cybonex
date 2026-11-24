from flask import Blueprint
from app.controllers.detect_controller import DetectController

detect_bp = Blueprint('detect', __name__)

detect_bp.route('/fake-news', methods=['POST'])(DetectController.fake_news)
detect_bp.route('/phishing', methods=['POST'])(DetectController.phishing)
detect_bp.route('/digital-fraud', methods=['POST'])(DetectController.digital_fraud)
detect_bp.route('/cross-modal', methods=['POST'])(DetectController.cross_modal)
detect_bp.route('/image', methods=['POST'])(DetectController.image_analysis)
