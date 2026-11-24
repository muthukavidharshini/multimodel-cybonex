from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth_middleware import require_auth
from app.models.analysis_model import AnalysisModel
from app.models.user_model import UserModel
from app.services.demo_service import is_demo_mode, get_dashboard_data
from app.utils.response_helpers import success_response, error_response
import logging

logger = logging.getLogger(__name__)


class DashboardController:

    @staticmethod
    @require_auth
    def stats():
        user_id = get_jwt_identity()
        claims = get_jwt() or {}

        if is_demo_mode() or claims.get('is_demo') or str(user_id).startswith('demo-'):
            return success_response(
                data=get_dashboard_data(
                    user_name=claims.get('name', 'Demo Presenter'),
                    user_email=claims.get('email', 'demo@cybernex.local'),
                )
            )

        try:
            stats = AnalysisModel.get_user_stats(user_id)
            weekly = AnalysisModel.get_weekly_activity(user_id)
            recent = AnalysisModel.get_user_history(user_id, limit=5)
            user = UserModel.find_by_id(user_id)

            # Sanitize recent for response
            for r in recent:
                if 'input_content' in r:
                    r['input_content'] = r['input_content'][:100]

            return success_response(data={
                'demo_mode': False,
                'stats': stats,
                'weekly_activity': weekly,
                'recent_analyses': recent,
                'user': {
                    'name': user['name'] if user else 'User',
                    'email': user['email'] if user else ''
                }
            })
        except Exception as e:
            logger.error(f"Dashboard stats error: {e}")
            return error_response('Failed to retrieve dashboard data', 500)
