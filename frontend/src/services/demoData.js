// Temporary Demo Mode sample data & client-side demonstration fallback.
// Never persists passwords or real user records.

export const DEMO_NOTICE =
  'Demonstration output generated in Demo Mode using sample simulation — not a live production AI prediction or verified threat intelligence.'

export const DEMO_USER_DEFAULT = {
  id: 'demo-presenter',
  name: 'Demo Presenter',
  email: 'demo@cybernex.local',
  is_demo: true,
}

export function getDemoDashboardData(user) {
  const today = new Date()
  const counts = [4, 7, 5, 9, 6, 10, 7]
  const weekly_activity = counts.map((count, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return { _id: d.toISOString().slice(0, 10), count }
  })

  return {
    demo_mode: true,
    demo_notice: 'Showing temporary sample statistics in Demo Mode. No database is connected.',
    stats: {
      total: 48,
      fake_news: 14,
      phishing: 16,
      digital_fraud: 11,
      cross_modal: 5,
      image: 2,
      high_risk: 19,
      medium_risk: 16,
      low_risk: 13,
    },
    weekly_activity,
    recent_analyses: getDemoHistory(),
    user: {
      name: user?.name || DEMO_USER_DEFAULT.name,
      email: user?.email || DEMO_USER_DEFAULT.email,
      is_demo: true,
    },
  }
}

export function getDemoHistory() {
  const now = Date.now()
  return [
    {
      _id: 'demo-fake-news-001',
      input_type: 'text',
      input_content:
        'SHOCKING BOMBSHELL: Secret miracle cure suppressed by mainstream media! Share before deleted!!!',
      detection_module: 'fake_news',
      prediction: 'Likely Fake',
      risk_score: 84,
      risk_level: 'High',
      confidence: 84,
      suspicious_indicators: [
        'Sensationalist keywords detected (shocking, bombshell, miracle cure)',
        'Urgency / virality cues: "share before deleted"',
        'Excessive punctuation (multiple exclamation marks)',
      ],
      credibility_markers: [],
      explanation:
        '[DEMO SAMPLE] High concentration of clickbait and sensationalist phrasing without credible attribution.',
      recommendations: [
        'Cross-check with established, reputable news sources.',
        'Look for original sourcing and author credentials.',
      ],
      is_demo: true,
      demo_notice: DEMO_NOTICE,
      created_at: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'demo-phishing-002',
      input_type: 'url',
      input_content: 'http://secure-bank-kyc-verify.tk/login?session=urgent',
      detection_module: 'phishing',
      prediction: 'Likely Phishing',
      risk_score: 88,
      risk_level: 'High',
      confidence: 88,
      suspicious_indicators: [
        'URL does not use HTTPS — connection is not encrypted',
        'Suspicious top-level domain (.tk)',
        'Phishing keywords in URL path (secure, bank, verify, login)',
      ],
      explanation:
        '[DEMO SAMPLE] URL exhibits multiple high-risk phishing indicators including unencrypted HTTP and suspicious TLD.',
      recommendations: [
        'Do not click on suspicious links.',
        'Verify the sender through an independent, official channel.',
      ],
      is_demo: true,
      demo_notice: DEMO_NOTICE,
      created_at: new Date(now - 5 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'demo-fraud-003',
      input_type: 'text',
      input_content:
        'Amount: 500 | Congratulations! You won Rs 10,00,000 in lucky draw. Pay Rs 500 UPI processing fee.',
      detection_module: 'digital_fraud',
      prediction: 'Likely Fraud',
      risk_score: 91,
      risk_level: 'High',
      confidence: 91,
      fraud_category: 'Lottery/Prize Scam',
      transaction_amount: 500,
      suspicious_indicators: [
        'Advance processing fee requested via UPI',
        'Unsolicited lottery/prize claim pattern',
        'Urgency combined with monetary request',
      ],
      explanation:
        '[DEMO SAMPLE] Matches Lottery/Prize Scam pattern requesting an upfront processing fee.',
      recommendations: [
        'Do not pay any advance fees or registration charges.',
        'Report fraud to cybercrime authorities (cybercrime.gov.in / 1930).',
      ],
      is_demo: true,
      demo_notice: DEMO_NOTICE,
      created_at: new Date(now - 24 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'demo-crossmodal-004',
      input_type: 'cross_modal',
      input_content:
        'Your KYC expires today. Verify Aadhaar and OTP at http://kyc-update-alert.xyz/verify',
      detection_module: 'cross_modal',
      prediction: 'High Risk Fraud / Phishing',
      risk_score: 86.5,
      risk_level: 'High',
      confidence: 86.5,
      suspicious_indicators: [
        'Suspicious TLD (.xyz) with credential keywords',
        'KYC suspension urgency combined with OTP request',
      ],
      explanation:
        '[DEMO SAMPLE] Text and URL modalities jointly indicate coordinated KYC phishing/fraud.',
      recommendations: [
        'Do not enter OTP or Aadhaar details on unverified links.',
      ],
      is_demo: true,
      demo_notice: DEMO_NOTICE,
      created_at: new Date(now - 48 * 3600 * 1000).toISOString(),
    },
    {
      _id: 'demo-safe-005',
      input_type: 'text',
      input_content:
        'According to researchers at Oxford University, a study published in Nature Medicine confirmed the findings.',
      detection_module: 'fake_news',
      prediction: 'Likely Real',
      risk_score: 14,
      risk_level: 'Low',
      confidence: 86,
      suspicious_indicators: [],
      credibility_markers: ['according to', 'researchers', 'published in', 'university'],
      explanation:
        '[DEMO SAMPLE] Neutral reporting tone with institutional attribution and no sensationalist markers.',
      recommendations: ['Cross-check primary sources before citing.'],
      is_demo: true,
      demo_notice: DEMO_NOTICE,
      created_at: new Date(now - 72 * 3600 * 1000).toISOString(),
    },
  ]
}

export function getDemoAnalysisById(id) {
  return getDemoHistory().find((item) => item._id === id) || getDemoHistory()[0]
}

export function simulateDemoFakeNews({ text = '', url = '' }) {
  const input = (text || url).toLowerCase()
  const sensational = ['shocking', 'bombshell', 'miracle cure', 'conspiracy', 'wake up', 'sheeple', 'share before', 'secret', 'exposed', '!!!']
  const credible = ['according to', 'researchers', 'published in', 'university', 'official statement', 'study', 'data shows']
  const foundSuspicious = sensational.filter((w) => input.includes(w))
  const foundCredible = credible.filter((w) => input.includes(w))

  let score = 28 + foundSuspicious.length * 16 - foundCredible.length * 10
  score = Math.max(8, Math.min(94, score))
  const risk_level = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'
  const prediction = score >= 65 ? 'Likely Fake' : score >= 35 ? 'Uncertain' : 'Likely Real'

  return {
    analysis_id: `demo-fn-${Date.now().toString(36)}`,
    prediction,
    risk_score: score,
    risk_level,
    confidence: Math.max(score, 100 - score),
    method: 'demo_sample',
    suspicious_indicators:
      foundSuspicious.length > 0
        ? foundSuspicious.map((w) => `Sensational / clickbait cue detected: "${w}"`)
        : score >= 35
          ? ['Limited institutional sourcing or verification cues in sample input']
          : [],
    credibility_markers: foundCredible,
    explanation:
      '[DEMO SAMPLE] Simulated linguistic pattern output for presentation. Does not verify factual accuracy.',
    recommendations: [
      'Cross-check with established, reputable news sources.',
      'Look for original sourcing and author credentials.',
    ],
    is_demo: true,
    demo_notice: DEMO_NOTICE,
  }
}

export function simulateDemoPhishing({ url = '', text = '' }) {
  const u = (url || '').toLowerCase()
  const t = (text || '').toLowerCase()
  const indicators = []
  let score = 12

  if (u) {
    if (u.startsWith('http://') || !u.startsWith('https://')) {
      score += 20
      indicators.push('URL does not use HTTPS — connection is not encrypted')
    }
    if (/\.(tk|ml|ga|cf|gq|xyz|top|club|online)\b/.test(u)) {
      score += 25
      indicators.push('Suspicious top-level domain detected')
    }
    if (/(verify|login|signin|secure|account|bank|update|confirm|password)/.test(u)) {
      score += 18
      indicators.push('Sensitive authentication keywords present in URL')
    }
    if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(u)) {
      score += 30
      indicators.push('IP address used instead of registered domain name')
    }
    if ((u.match(/-/g) || []).length >= 2) {
      score += 12
      indicators.push('Multiple hyphens in URL domain — common spoofing pattern')
    }
  }
  if (t) {
    if (/(otp|password|pin|cvv|verify your account|suspended|urgent|click here)/.test(t)) {
      score += 35
      indicators.push('Urgency or credential-harvesting language detected in message')
    }
  }

  score = Math.max(8, Math.min(96, score))
  const risk_level = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'
  const prediction = score >= 65 ? 'Likely Phishing' : score >= 35 ? 'Suspicious' : 'Likely Safe'

  return {
    analysis_id: `demo-ph-${Date.now().toString(36)}`,
    prediction,
    risk_score: score,
    risk_level,
    confidence: Math.max(score, 100 - score),
    method: 'demo_sample',
    suspicious_indicators: indicators,
    explanation:
      '[DEMO SAMPLE] Simulated phishing risk output for demonstration only. Does not verify actual URL safety.',
    recommendations: [
      'Do not click on unverified links or share OTPs/passwords.',
      'Verify the domain directly via an official bookmark or app.',
    ],
    is_demo: true,
    demo_notice: DEMO_NOTICE,
  }
}

export function simulateDemoFraud({ text = '', amount = '' }) {
  const t = (text || '').toLowerCase()
  const indicators = []
  let score = 15
  let category = 'Unknown'

  if (/(lottery|won|winner|prize|lucky draw)/.test(t)) {
    category = 'Lottery/Prize Scam'
    score += 40
    indicators.push('Unsolicited prize or lottery winning claim')
  } else if (/(work from home|earn.*daily|part time|job offer|registration fee)/.test(t)) {
    category = 'Job Scam'
    score += 38
    indicators.push('Unrealistic income or advance job registration fee pattern')
  } else if (/(upi|gpay|phonepe|paytm|kyc|otp|account.*block)/.test(t)) {
    category = 'UPI/Payment Scam'
    score += 38
    indicators.push('Urgent KYC / UPI payment or OTP verification pattern')
  }

  if (/(urgent|immediately|today|expire|blocked|suspended)/.test(t)) {
    score += 18
    indicators.push('Artificial urgency / account threat pressure')
  }
  if (/(fee|rs|₹|\$|transfer|pay|send)/.test(t)) {
    score += 15
    indicators.push('Financial transfer or upfront fee request')
  }

  const numAmount = Number(amount)
  if (!Number.isNaN(numAmount) && numAmount >= 50000) {
    score += 15
    indicators.push(`High transaction amount flagged (${numAmount.toLocaleString()})`)
  } else if (!Number.isNaN(numAmount) && numAmount > 0 && score >= 35) {
    indicators.push(`Transaction amount entered: ${numAmount.toLocaleString()}`)
  }

  score = Math.max(10, Math.min(97, score))
  const risk_level = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'
  const prediction = score >= 65 ? 'Likely Fraud' : score >= 35 ? 'Suspicious' : 'Likely Legitimate'

  return {
    analysis_id: `demo-fr-${Date.now().toString(36)}`,
    prediction,
    risk_score: score,
    risk_level,
    fraud_category: category,
    transaction_amount: amount || null,
    confidence: Math.max(score, 100 - score),
    method: 'demo_sample',
    suspicious_indicators: indicators,
    explanation:
      '[DEMO SAMPLE] Simulated fraud pattern assessment for demonstration purposes only.',
    recommendations: [
      'Never pay advance processing or registration fees.',
      'Report suspicious transactions to cybercrime.gov.in or call 1930.',
    ],
    is_demo: true,
    demo_notice: DEMO_NOTICE,
  }
}

export function simulateDemoCrossModal({ text = '', url = '' }) {
  const fn = text ? simulateDemoFakeNews({ text }) : null
  const ph = url ? simulateDemoPhishing({ url }) : null
  const fr = text ? simulateDemoFraud({ text }) : null
  const parts = []
  if (fn) parts.push({ key: 'fake_news', score: fn.risk_score, w: 1.0, ind: fn.suspicious_indicators })
  if (fr) parts.push({ key: 'digital_fraud', score: fr.risk_score, w: 1.0, ind: fr.suspicious_indicators })
  if (ph) parts.push({ key: 'phishing', score: ph.risk_score, w: 1.2, ind: ph.suspicious_indicators })

  const totalW = parts.reduce((acc, p) => acc + p.w, 0) || 1
  const score = Math.round((parts.reduce((acc, p) => acc + p.score * p.w, 0) / totalW) * 10) / 10
  const risk_level = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'
  const final_label = score >= 65 ? 'High Risk Cross-Modal Threat' : score >= 35 ? 'Suspicious Content' : 'Low Risk Content'

  const modality_results = {}
  if (text) modality_results.text = { fake_news: fn, digital_fraud: fr }
  if (url) modality_results.url = ph

  return {
    analysis_id: `demo-cm-${Date.now().toString(36)}`,
    final_label,
    prediction: final_label,
    risk_score: score,
    risk_level,
    is_cross_modal: Boolean(text && url),
    method: 'demo_sample',
    modality_results,
    suspicious_indicators: Array.from(new Set(parts.flatMap((p) => p.ind))),
    explanation:
      '[DEMO SAMPLE] Simulated weighted cross-modal fusion output (URL 1.2x, Text 1.0x) for demonstration.',
    recommendations: [
      'Cross-verify both message claims and embedded links independently.',
    ],
    is_demo: true,
    demo_notice: DEMO_NOTICE,
  }
}
