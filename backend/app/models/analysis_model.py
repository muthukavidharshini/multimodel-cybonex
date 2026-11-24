from datetime import datetime, timezone, timedelta
from bson import ObjectId
from app.models.database import get_db
import logging

logger = logging.getLogger(__name__)


class AnalysisModel:

    @staticmethod
    def save_analysis(user_id: str, data: dict) -> str:
        db = get_db()
        record = {
            'user_id': user_id,
            'input_type': data.get('input_type', 'text'),
            'input_content': str(data.get('input_content', ''))[:500],
            'detection_module': data.get('detection_module', 'unknown'),
            'prediction': data.get('prediction', ''),
            'risk_score': float(data.get('risk_score', 0)),
            'risk_level': data.get('risk_level', 'Low'),
            'confidence': data.get('confidence'),
            'fraud_category': data.get('fraud_category'),
            'suspicious_indicators': data.get('suspicious_indicators', []),
            'explanation': data.get('explanation', ''),
            'recommendations': data.get('recommendations', []),
            'modality_results': data.get('modality_results', {}),
            'extracted_text': str(data.get('extracted_text', ''))[:1000],
            'created_at': datetime.now(timezone.utc)
        }
        result = db.analysis_history.insert_one(record)
        return str(result.inserted_id)

    @staticmethod
    def save_model_result(analysis_id: str, model_data: dict):
        db = get_db()
        record = {
            'analysis_id': analysis_id,
            'model_name': model_data.get('model_name', ''),
            'model_version': model_data.get('model_version', '1.0'),
            'prediction': model_data.get('prediction', ''),
            'model_score': model_data.get('model_score', 0),
            'extracted_features': model_data.get('extracted_features', {}),
            'created_at': datetime.now(timezone.utc)
        }
        db.model_results.insert_one(record)

    @staticmethod
    def get_user_history(user_id: str, limit: int = 50, skip: int = 0) -> list:
        db = get_db()
        cursor = db.analysis_history.find(
            {'user_id': user_id}
        ).sort('created_at', -1).skip(skip).limit(limit)
        results = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            # Serialize datetime
            if 'created_at' in doc and hasattr(doc['created_at'], 'isoformat'):
                doc['created_at'] = doc['created_at'].isoformat()
            results.append(doc)
        return results

    @staticmethod
    def get_analysis_by_id(analysis_id: str, user_id: str) -> dict | None:
        db = get_db()
        try:
            doc = db.analysis_history.find_one({
                '_id': ObjectId(analysis_id),
                'user_id': user_id
            })
            if doc:
                doc['_id'] = str(doc['_id'])
                if 'created_at' in doc and hasattr(doc['created_at'], 'isoformat'):
                    doc['created_at'] = doc['created_at'].isoformat()
            return doc
        except Exception as e:
            logger.error(f"get_analysis_by_id error: {e}")
            return None

    @staticmethod
    def delete_analysis(analysis_id: str, user_id: str) -> bool:
        db = get_db()
        try:
            result = db.analysis_history.delete_one({
                '_id': ObjectId(analysis_id),
                'user_id': user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"delete_analysis error: {e}")
            return False

    @staticmethod
    def get_user_stats(user_id: str) -> dict:
        db = get_db()
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$detection_module',
                'count': {'$sum': 1},
                'high_risk': {'$sum': {'$cond': [{'$eq': ['$risk_level', 'High']}, 1, 0]}}
            }}
        ]
        raw = list(db.analysis_history.aggregate(pipeline))
        stats = {
            'total': 0,
            'fake_news': 0,
            'phishing': 0,
            'digital_fraud': 0,
            'cross_modal': 0,
            'image': 0,
            'high_risk': 0
        }
        module_map = {
            'fake_news': 'fake_news',
            'phishing': 'phishing',
            'digital_fraud': 'digital_fraud',
            'cross_modal': 'cross_modal',
            'image': 'image'
        }
        for item in raw:
            key = module_map.get(item['_id'], None)
            count = item['count']
            stats['total'] += count
            stats['high_risk'] += item.get('high_risk', 0)
            if key:
                stats[key] = count
        return stats

    @staticmethod
    def get_weekly_activity(user_id: str) -> list:
        db = get_db()
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=6)
        pipeline = [
            {'$match': {
                'user_id': user_id,
                'created_at': {'$gte': seven_days_ago}
            }},
            {'$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$created_at',
                        'timezone': 'UTC'
                    }
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        return list(db.analysis_history.aggregate(pipeline))
