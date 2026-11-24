from datetime import datetime, timezone
from bson import ObjectId
import bcrypt
from app.models.database import get_db


class UserModel:

    @staticmethod
    def create_user(name: str, email: str, password: str) -> dict:
        db = get_db()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = {
            'name': name,
            'email': email.lower().strip(),
            'password_hash': password_hash,
            'created_at': datetime.now(timezone.utc)
        }
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        return user

    @staticmethod
    def find_by_email(email: str) -> dict | None:
        db = get_db()
        return db.users.find_one({'email': email.lower().strip()})

    @staticmethod
    def find_by_id(user_id: str) -> dict | None:
        db = get_db()
        try:
            return db.users.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

    @staticmethod
    def email_exists(email: str) -> bool:
        db = get_db()
        return db.users.find_one({'email': email.lower().strip()}) is not None
