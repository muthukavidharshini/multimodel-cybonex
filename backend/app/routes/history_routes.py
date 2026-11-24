from flask import Blueprint
from app.controllers.history_controller import HistoryController

history_bp = Blueprint('history', __name__)

# Accept both /history and /history/ to avoid redirect issues
history_bp.route('', methods=['GET'])(HistoryController.get_history)
history_bp.route('/', methods=['GET'])(HistoryController.get_history)
history_bp.route('/<analysis_id>', methods=['GET'])(HistoryController.get_one)
history_bp.route('/<analysis_id>', methods=['DELETE'])(HistoryController.delete_one)
