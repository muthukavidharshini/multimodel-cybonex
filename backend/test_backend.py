"""
Backend Connectivity Test Script
==================================
Tests all API endpoints without needing the frontend.
Run: python test_backend.py

Requires the backend to be running: python run.py
"""

import requests
import json
import sys

BASE = 'http://localhost:5000/api'
TOKEN = None
USER_ID = None

PASS = '✅'
FAIL = '❌'
INFO = '  ℹ'


def test(name, fn):
    try:
        result = fn()
        print(f"{PASS} {name}: {result}")
        return True
    except AssertionError as e:
        print(f"{FAIL} {name}: ASSERTION FAILED — {e}")
        return False
    except Exception as e:
        print(f"{FAIL} {name}: ERROR — {e}")
        return False


def headers():
    return {'Authorization': f'Bearer {TOKEN}'} if TOKEN else {}


# ─── Health ──────────────────────────────────────────────────────────────────
print("\n=== Backend Connectivity Tests ===\n")

def test_health():
    r = requests.get(f'{BASE}/health', timeout=5)
    assert r.status_code == 200, f"Status {r.status_code}"
    return r.json()['message']

if not test('Health check', test_health):
    print(f"\n{FAIL} Backend is not responding. Run: python run.py")
    sys.exit(1)

# ─── Auth ─────────────────────────────────────────────────────────────────────
import time
test_email = f"test_{int(time.time())}@example.com"
test_password = "testpass1"

def test_register():
    r = requests.post(f'{BASE}/auth/register', json={
        'name': 'Test User',
        'email': test_email,
        'password': test_password
    }, timeout=10)
    assert r.status_code == 201, f"Status {r.status_code}: {r.text}"
    global TOKEN
    TOKEN = r.json()['data']['token']
    return f"token obtained, user: {r.json()['data']['user']['email']}"

def test_login():
    r = requests.post(f'{BASE}/auth/login', json={
        'email': test_email,
        'password': test_password
    }, timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    global TOKEN
    TOKEN = r.json()['data']['token']
    return "login successful"

def test_profile():
    r = requests.get(f'{BASE}/auth/profile', headers=headers(), timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    return r.json()['data']['email']

def test_duplicate_register():
    r = requests.post(f'{BASE}/auth/register', json={
        'name': 'Test', 'email': test_email, 'password': testpassword
    }, timeout=5)
    assert r.status_code == 409, f"Expected 409, got {r.status_code}"
    return "duplicate correctly rejected"

test('Register', test_register)
test('Login', test_login)
test('Profile', test_profile)

# ─── Detection ────────────────────────────────────────────────────────────────
print()

def test_fake_news():
    r = requests.post(f'{BASE}/detect/fake-news', json={
        'text': 'BREAKING: Scientists discover that drinking bleach cures all diseases! '
                'Share before they delete this! The government is hiding this bombshell secret!'
    }, headers=headers(), timeout=15)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    assert 'risk_score' in d, "Missing risk_score"
    assert 'prediction' in d, "Missing prediction"
    assert 'analysis_id' in d, "Missing analysis_id"
    return f"prediction={d['prediction']}, score={d['risk_score']}, method={d['method']}"

def test_phishing_url():
    r = requests.post(f'{BASE}/detect/phishing', json={
        'url': 'http://secure-login-verify.tk/account-suspended/update-now'
    }, headers=headers(), timeout=15)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    return f"prediction={d['prediction']}, score={d['risk_score']}"

def test_phishing_text():
    r = requests.post(f'{BASE}/detect/phishing', json={
        'text': 'Dear customer, your account has been suspended. '
                'Click here immediately to verify your OTP and bank account details: http://bit.ly/verify-now'
    }, headers=headers(), timeout=15)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    return f"prediction={d['prediction']}, score={d['risk_score']}"

def test_fraud():
    r = requests.post(f'{BASE}/detect/digital-fraud', json={
        'text': 'Congratulations! You have won Rs 10,00,000 in our lucky draw! '
                'Send Rs 500 processing fee via UPI to claim your prize. Contact on WhatsApp immediately!'
    }, headers=headers(), timeout=15)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    return f"prediction={d['prediction']}, category={d['fraud_category']}, score={d['risk_score']}"

def test_cross_modal():
    r = requests.post(f'{BASE}/detect/cross-modal', json={
        'text': 'You have been selected! Send OTP and bank details to claim prize.',
        'url': 'http://free-prize-claim.tk/winner'
    }, headers=headers(), timeout=15)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    return f"label={d['final_label']}, score={d['risk_score']}, cross_modal={d['is_cross_modal']}"

test('Fake News Detection', test_fake_news)
test('Phishing URL Detection', test_phishing_url)
test('Phishing Text Detection', test_phishing_text)
test('Digital Fraud Detection', test_fraud)
test('Cross-Modal Analysis', test_cross_modal)

# ─── History & Dashboard ──────────────────────────────────────────────────────
print()

def test_history():
    r = requests.get(f'{BASE}/history', headers=headers(), timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    count = d.get('count', 0)
    return f"{count} records in history"

def test_dashboard():
    r = requests.get(f'{BASE}/dashboard/stats', headers=headers(), timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    d = r.json()['data']
    stats = d['stats']
    return f"total={stats['total']}, high_risk={stats['high_risk']}"

def test_validation_error():
    r = requests.post(f'{BASE}/detect/fake-news', json={}, headers=headers(), timeout=5)
    assert r.status_code == 400, f"Expected 400, got {r.status_code}"
    return "empty input correctly rejected"

def test_no_auth():
    r = requests.get(f'{BASE}/history', timeout=5)
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    return "unauthenticated request correctly rejected"

test('Get History', test_history)
test('Dashboard Stats', test_dashboard)
test('Input Validation', test_validation_error)
test('Auth Enforcement', test_no_auth)

print("\n=== Test Run Complete ===\n")
