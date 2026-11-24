"""
WSGI entry point for Render deployment.
Render uses gunicorn to serve the Flask app.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app('production')

if __name__ == '__main__':
    app.run()
