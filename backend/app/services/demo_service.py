"""
Temporary Demo Mode Service
===========================
Provides non-persistent, sample demonstration data when DEMO_MODE=true.
Does NOT connect to MongoDB, does NOT store passwords or personal info,
and does NOT permanently save detection history.
"""

from datetime import datetime, timedelta, timezone
from flask import current_app


DEMO_NOTICE = (
    'Demonstration output generated in Demo Mode using sample/heuristic simulation. '
    'Do not treat this as a live production AI verdict or verified threat intelligence.'
)


def is_demo_mode() -> bool:
    return bool(current_app.config.get('DEMO_MODE', False))


def get_sample_history() -> list[dict]:
    now = datetime.now(timezone.utc)
    return [
        {
            '_id': 'demo-fake-news-001',
            'user_id': 'demo-user',
            'input_type': 'text',
            'input_content': (
                'SHOCKING BOMBSHELL: Secret miracle cure suppressed by mainstream media! '
                'Share before deleted!!!'
            ),
            'detection_module': 'fake_news',
            'prediction': 'Likely Fake',
            'risk_score': 84.0,
            'risk_level': 'High',
            'confidence': 84.0,
            'suspicious_indicators': [
                'Sensationalist keywords detected (shocking, bombshell, miracle cure)',
                'Urgency / virality cues: "share before deleted"',
                'Excessive punctuation (multiple exclamation marks)',
                'Lacks verifiable institutional attribution or primary source'
            ],
            'credibility_markers': [],
            'explanation': (
                '[DEMO SAMPLE] High concentration of clickbait and sensationalist phrasing '
                'without credible sourcing markers.'
            ),
            'recommendations': [
                'Cross-check with established, reputable news sources.',
                'Look for original sourcing and author credentials.',
                'Check fact-checking platforms before sharing.'
            ],
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': (now - timedelta(hours=2)).isoformat(),
        },
        {
            '_id': 'demo-phishing-002',
            'user_id': 'demo-user',
            'input_type': 'url',
            'input_content': 'http://secure-bank-kyc-verify.tk/login?session=urgent',
            'detection_module': 'phishing',
            'prediction': 'Likely Phishing',
            'risk_score': 88.0,
            'risk_level': 'High',
            'confidence': 88.0,
            'suspicious_indicators': [
                'URL does not use HTTPS — connection is not encrypted',
                'Suspicious top-level domain (.tk)',
                'Phishing keywords found in URL path (secure, bank, verify, login)',
                'Multiple hyphens in domain — common impersonation pattern'
            ],
            'explanation': (
                '[DEMO SAMPLE] URL exhibits multiple high-risk phishing indicators including '
                'unencrypted HTTP, high-risk TLD, and credential-harvesting keywords.'
            ),
            'recommendations': [
                'Do not click on suspicious links.',
                'Verify the sender through an independent, official channel.',
                'Never share OTPs, passwords, or bank credentials.'
            ],
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': (now - timedelta(hours=5)).isoformat(),
        },
        {
            '_id': 'demo-fraud-003',
            'user_id': 'demo-user',
            'input_type': 'text',
            'input_content': (
                'Amount: 500 | Congratulations! You won Rs 10,00,000 in lucky draw. '
                'Pay Rs 500 UPI processing fee immediately.'
            ),
            'detection_module': 'digital_fraud',
            'prediction': 'Likely Fraud',
            'risk_score': 91.0,
            'risk_level': 'High',
            'confidence': 91.0,
            'fraud_category': 'Lottery/Prize Scam',
            'transaction_amount': 500,
            'suspicious_indicators': [
                'Advance processing fee requested via UPI',
                'Unsolicited lottery/prize claim pattern',
                'Urgency pressure ("immediately") combined with monetary request'
            ],
            'explanation': (
                '[DEMO SAMPLE] Matches Lottery/Prize Scam pattern requesting an upfront '
                'processing fee to release supposed winnings.'
            ),
            'recommendations': [
                'Do not pay any advance fees or registration charges.',
                'Report fraud to cybercrime authorities (cybercrime.gov.in / 1930).'
            ],
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': (now - timedelta(days=1)).isoformat(),
        },
        {
            '_id': 'demo-crossmodal-004',
            'user_id': 'demo-user',
            'input_type': 'cross_modal',
            'input_content': (
                'Your KYC expires today. Verify Aadhaar and OTP at http://kyc-update-alert.xyz/verify'
            ),
            'detection_module': 'cross_modal',
            'prediction': 'High Risk Fraud / Phishing',
            'risk_score': 86.5,
            'risk_level': 'High',
            'confidence': 86.5,
            'suspicious_indicators': [
                'Suspicious TLD (.xyz) with credential keywords',
                'KYC suspension urgency combined with OTP request',
                'Cross-modal agreement between text and URL risk signals'
            ],
            'explanation': (
                '[DEMO SAMPLE] Both text modality (1.0x) and URL modality (1.2x) indicate '
                'coordinated KYC phishing/fraud activity.'
            ),
            'recommendations': [
                'Do not enter OTP or Aadhaar details on unverified links.',
                'Contact your bank directly through its official mobile app.'
            ],
            'modality_results': {
                'text': {'digital_fraud': {'risk_score': 82, 'label': 'Likely Fraud'}},
                'url': {'risk_score': 90, 'label': 'Likely Phishing'},
            },
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': (now - timedelta(days=2)).isoformat(),
        },
        {
            '_id': 'demo-safe-005',
            'user_id': 'demo-user',
            'input_type': 'text',
            'input_content': (
                'According to researchers at Oxford University, a study published in Nature '
                'Medicine confirmed the findings with official institutional data.'
            ),
            'detection_module': 'fake_news',
            'prediction': 'Likely Real',
            'risk_score': 14.0,
            'risk_level': 'Low',
            'confidence': 86.0,
            'suspicious_indicators': [],
            'credibility_markers': ['according to', 'researchers found', 'published in', 'university'],
            'explanation': (
                '[DEMO SAMPLE] Text uses neutral reporting tone with institutional attribution '
                'and lacks sensationalist markers.'
            ),
            'recommendations': [
                'No specific threat action required, but always cross-check primary sources.'
            ],
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': (now - timedelta(days=3)).isoformat(),
        },
    ]


def get_sample_analysis_by_id(analysis_id: str) -> dict | None:
    for item in get_sample_history():
        if item['_id'] == analysis_id:
            return item
    if str(analysis_id).startswith('demo-'):
        now = datetime.now(timezone.utc)
        return {
            '_id': analysis_id,
            'user_id': 'demo-user',
            'input_type': 'text',
            'input_content': 'Temporary Demo Mode analysis session output (not persisted).',
            'detection_module': 'cross_modal',
            'prediction': 'Demonstration Analysis',
            'risk_score': 45.0,
            'risk_level': 'Medium',
            'confidence': 75.0,
            'suspicious_indicators': [
                'Transient demo scan ID — history is not permanently saved in Demo Mode'
            ],
            'explanation': DEMO_NOTICE,
            'recommendations': [
                'Download PDF directly from the scan result card or disable DEMO_MODE with MongoDB configured to persist history.'
            ],
            'is_demo': True,
            'demo_notice': DEMO_NOTICE,
            'created_at': now.isoformat(),
        }
    return None


def get_dashboard_data(user_name: str = 'Demo Presenter', user_email: str = 'demo@cybernex.local') -> dict:
    now = datetime.now(timezone.utc)
    counts = [4, 7, 5, 9, 6, 10, 7]
    weekly_activity = [
        {
            '_id': (now - timedelta(days=6 - idx)).strftime('%Y-%m-%d'),
            'count': counts[idx],
        }
        for idx in range(7)
    ]
    return {
        'demo_mode': True,
        'demo_notice': 'Showing temporary sample statistics in Demo Mode. No database is connected or modified.',
        'stats': {
            'total': 48,
            'fake_news': 14,
            'phishing': 16,
            'digital_fraud': 11,
            'cross_modal': 5,
            'image': 2,
            'high_risk': 19,
            'medium_risk': 16,
            'low_risk': 13,
        },
        'weekly_activity': weekly_activity,
        'recent_analyses': get_sample_history(),
        'user': {
            'name': user_name,
            'email': user_email,
            'is_demo': True,
        },
    }
