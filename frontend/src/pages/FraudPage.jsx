import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, DollarSign, RotateCcw } from 'lucide-react'
import { detectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { simulateDemoFraud } from '../services/demoData'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import toast from 'react-hot-toast'

const CATS = ['UPI/Payment Scam', 'Job Scam', 'Lottery/Prize Scam', 'Shopping Scam', 'Investment Scam', 'Impersonation Scam', 'Loan Scam']

const EXAMPLES = [
  {
    label: 'Lottery scam',
    amount: '500',
    text: 'Congratulations! You have won Rs 10,00,000 in our lucky draw! Send Rs 500 processing fee via UPI to claim your prize. Contact on WhatsApp immediately!',
  },
  {
    label: 'Job scam',
    amount: '999',
    text: 'Work from home job offer! Earn Rs 5000 daily guaranteed. No experience needed. Part time hiring. Apply now! Registration fee Rs 999 only.',
  },
  {
    label: 'UPI/KYC scam',
    amount: '75000',
    text: 'Your KYC is expiring today. Your account will be blocked. Verify your Aadhaar and OTP immediately on this link to avoid suspension.',
  },
]

export default function FraudPage() {
  const { demoMode } = useAuth()
  const [amount, setAmount] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyse = async (e) => {
    e.preventDefault()
    if (!text.trim()) { toast.error('Enter transaction details or suspicious message'); return }
    setLoading(true); setResult(null)
    try {
      const payload = { text: text.trim(), amount: amount.trim() || undefined }
      const r = await detectAPI.digitalFraud(payload)
      setResult(r.data.data)
    } catch (err) {
      if (demoMode && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        setResult(simulateDemoFraud({ text: text.trim(), amount: amount.trim() }))
      } else {
        toast.error(err.response?.data?.message || 'Analysis failed')
      }
    } finally { setLoading(false) }
  }

  const reset = () => {
    setAmount('')
    setText('')
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ea580c, #ef4444)', boxShadow: '0 0 20px rgba(234,88,12,0.3)' }}>
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Digital Fraud Detection</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {demoMode ? 'Demo Mode active · Sample transaction & scam pattern simulation' : '7-category scam pattern recognition + ML classification'}
          </p>
        </div>
      </div>

      {demoMode && (
        <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Demo Mode: Outputs are simulated demonstration results for presentation and do not connect to live banking fraud systems.
          </p>
        </div>
      )}

      {/* Category pills */}
      <div className="cx-card p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Detectable Categories</div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <span key={c} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="cx-card-glow p-6 space-y-5">
        <form onSubmit={analyse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Transaction Amount <span className="text-slate-600">(optional, INR / USD)</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="0"
                step="any"
                className="cx-input pl-10 font-mono text-sm"
                placeholder="e.g. 500 or 75000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Transaction Details / Suspicious Message
            </label>
            <textarea className="cx-textarea min-h-[160px] text-sm"
              placeholder="Paste transaction alert, UPI request, SMS, WhatsApp message, job offer, lottery notice, or payment details…"
              value={text} onChange={e => setText(e.target.value)} maxLength={5000} />
            <div className="text-[10px] text-slate-600 text-right mt-1 font-mono">{text.length}/5000</div>
          </div>

          {/* Quick examples */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Quick Examples</div>
            {EXAMPLES.map(ex => (
              <button key={ex.label} type="button"
                onClick={() => { setAmount(ex.amount); setText(ex.text); setResult(null) }}
                className="w-full text-left p-3 rounded-xl transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-orange-500/80">{ex.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">Amount: {ex.amount}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{ex.text.slice(0, 90)}…</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="submit" className="cx-btn-primary flex-1 py-3" disabled={loading}>
              {loading ? 'Analysing Transaction…' : 'Analyze Transaction'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading || (!amount && !text && !result)}
              className="cx-btn-secondary py-3 px-4"
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner message="Identifying fraud patterns…" sub="Evaluating transaction amount + 7-category rule engine" />}
      {result && !loading && <ResultCard result={result} />}
    </div>
  )
}
