import React from 'react'
import { useNavigate } from 'react-router-dom'
import RiskBadge from './RiskBadge'
import RiskMeter from './RiskMeter'
import IndicatorList from './IndicatorList'
import { Download, ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { reportAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

export default function ResultCard({ result }) {
  const navigate = useNavigate()
  const { demoMode } = useAuth()
  const level = result.risk_level || 'Low'
  const score = result.risk_score || 0
  const prediction = result.prediction || result.final_label || 'Analysis Complete'
  const isDemoResult = Boolean(result.is_demo || demoMode)

  const downloadPdf = async () => {
    if (!result.analysis_id) return
    const tid = toast.loading('Generating PDF report…')
    try {
      const res = await reportAPI.getPdf(result.analysis_id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `cybernex_report_${result.analysis_id.slice(0, 8)}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      toast.dismiss(tid); toast.success('Report downloaded')
    } catch {
      // Fallback client-side PDF generation in Demo Mode
      try {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('CYBERNEX AI — Demonstration Analysis Report', 14, 20)
        doc.setFontSize(11)
        doc.text(`Prediction: ${prediction}`, 14, 34)
        doc.text(`Risk Score: ${score} / 100 (${level})`, 14, 42)
        if (result.fraud_category && result.fraud_category !== 'Unknown') {
          doc.text(`Category: ${result.fraud_category}`, 14, 50)
        }
        doc.text('Explanation:', 14, 62)
        doc.text(doc.splitTextToSize(result.explanation || 'Sample demonstration output.', 180), 14, 70)
        doc.save(`cybernex_demo_${result.analysis_id.slice(0, 8)}.pdf`)
        toast.dismiss(tid); toast.success('Demo PDF downloaded')
      } catch {
        toast.dismiss(tid)
        toast.error('Could not generate PDF')
      }
    }
  }

  const borderColor = level === 'High' ? 'rgba(239,68,68,0.3)' : level === 'Medium' ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'
  const glowColor   = level === 'High' ? 'rgba(239,68,68,0.08)' : level === 'Medium' ? 'rgba(249,115,22,0.08)' : 'rgba(34,197,94,0.08)'

  return (
    <div className="cx-card-glow mt-6 animate-slide-up overflow-hidden"
      style={{ border: `1px solid ${borderColor}`, background: `linear-gradient(135deg, ${glowColor}, rgba(255,255,255,0.02))` }}>

      {isDemoResult && (
        <div
          className="px-6 py-2.5 flex items-center gap-2 text-xs"
          style={{
            background: 'rgba(245,158,11,0.12)',
            borderBottom: '1px solid rgba(245,158,11,0.22)',
            color: '#fde68a',
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Demonstration Output:</strong> Sample/simulated result for presentation purposes — not a live production AI verdict or verified threat intelligence.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-white">{prediction}</h3>
              <RiskBadge level={level} size="lg" />
              {isDemoResult && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  Demo Sample
                </span>
              )}
            </div>
            {result.fraud_category && result.fraud_category !== 'Unknown' && (
              <div className="text-sm font-medium text-orange-400">
                Category: {result.fraud_category}
              </div>
            )}
            {result.transaction_amount !== undefined && result.transaction_amount !== null && result.transaction_amount !== '' && (
              <div className="text-xs font-mono text-slate-400">
                Transaction Amount: {result.transaction_amount}
              </div>
            )}
            {result.analysis_id && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3 h-3" />
                ID: {result.analysis_id.slice(0, 16)}…
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {result.analysis_id && (
              <>
                <button onClick={downloadPdf} className="cx-btn-secondary text-xs py-2 px-3">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={() => navigate(`/results/${result.analysis_id}`, { state: { result } })}
                  className="cx-btn-primary text-xs py-2 px-3">
                  Full Report <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Risk meter */}
        <RiskMeter score={score} />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {result.confidence !== undefined && result.confidence !== null && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
              <div className="text-lg font-bold text-white">{result.confidence}%</div>
            </div>
          )}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Method</div>
            <div className="text-xs font-semibold text-blue-400 capitalize">
              {(result.method || 'heuristic').replace(/_/g, ' ')}
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Level</div>
            <div className="text-xs font-bold" style={{
              color: level === 'High' ? '#ef4444' : level === 'Medium' ? '#f97316' : '#22c55e'
            }}>{level}</div>
          </div>
        </div>

        {/* Indicators */}
        {((result.suspicious_indicators || []).length > 0 || (result.credibility_markers || []).length > 0) && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Threat Indicators
            </h4>
            <IndicatorList
              indicators={result.suspicious_indicators || []}
              credibilityMarkers={result.credibility_markers || []}
            />
          </div>
        )}

        {/* Explanation */}
        {result.explanation && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
              {isDemoResult ? 'Demonstration Explanation' : 'AI Analysis'}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Recommended Actions
            </h4>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
