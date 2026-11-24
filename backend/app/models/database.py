from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
import logging

logger = logging.getLogger(__name__)

_client = None
_db = None


def get_db():
    """
    Return the MongoDB database instance.
    Lazily connects on first call; raises ConnectionError if MongoDB is unreachable.
    """
    global _client, _db
    if _db is None:
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/crossmodal_db')
        try:
            _client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=10000
            )
            # Verify connection is alive
            _client.admin.command('ping')
            db_name = _parse_db_name(mongo_uri)
            _db = _client[db_name]
            _ensure_indexes(_db)
            logger.info(f"Connected to MongoDB: {db_name}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            _client = None
            _db = None
            raise ConnectionError(
                f"Could not connect to MongoDB at '{mongo_uri}'. "
                f"Make sure MongoDB is running. Original error: {e}"
            )
        except Exception as e:
            _client = None
            _db = None
            raise ConnectionError(f"MongoDB connection error: {e}")
    return _db


def reset_connection():
    """Force a reconnection on the next get_db() call."""
    global _client, _db
    if _client:
        try:
            _client.close()
        except Exception:
            pass
    _client = None
    _db = None


def _parse_db_name(uri: str) -> str:
    """Extract database name from MongoDB URI."""
    try:
        # mongodb://host:port/dbname or mongodb+srv://user:pass@host/dbname
        path = uri.split('/')[-1].split('?')[0].strip()
        return path if path else 'crossmodal_db'
    except Exception:
        return 'crossmodal_db'


def _ensure_indexes(db):
    try:
        db.users.create_index([('email', ASCENDING)], unique=True)
        db.analysis_history.create_index([('user_id', ASCENDING)])
        db.analysis_history.create_index([('created_at', DESCENDING)])
        db.model_results.create_index([('analysis_id', ASCENDING)])
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")
