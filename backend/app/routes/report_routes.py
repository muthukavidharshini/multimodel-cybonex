from flask import Blueprint
from app.controllers.report_controller import ReportController

report_bp = Blueprint('reports', __name__)

report_bp.route('/<analysis_id>/pdf', methods=['GET'])(ReportController.generate_pdf)
