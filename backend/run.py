import os
import sys
# Add backend directory to path so imports work from any working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = env == 'development'
    print(f"\n  Cross-Modal Intelligence API")
    print(f"  Running on http://localhost:{port}")
    print(f"  Mode: {env} | Debug: {debug}\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
