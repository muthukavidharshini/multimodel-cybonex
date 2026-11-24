import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { historyAPI, reportAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getDemoAnalysisById } from '../services/demoData'
import RiskBadge from '../components/RiskBadge'
import RiskMeter from '../components/RiskMeter'
import IndicatorList from '../components/IndicatorList'
import { Download, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

const MOD = { fake_news:'Fake News Detection', phishing:'Phishing Detection', digital_fraud:'Digital Fraud Detection', cross_modal:'Cross-Modal Analysis', image:'Image Analysis' }

export default function ResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const { demoMode } = useAuth()
  const [rec, setRec] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!location.state?.result)

  useEffect(() => {
    if (location.state?.result) return
    historyAPI.getOne(id)
      .then(r => setRec(r.data.data))
      .catch(err => {
        if (demoMode) {
          setRec(getDemoAnalysisById(id))
        } else {
          toast.error(err.response?.data?.message || 'Could not load analysis')
        }
      })
      .finally(() => setLoading(false))
  }, [id, demoMode, location.state])

  const downloadPdf = async () => {
    const tid = toast.loading('Generating report…')
    try {
      const r = await reportAPI.getPdf(id)
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url
      a.download = `cybernex_${id.slice(0,8)}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      toast.dismiss(tid); toast.success('Downloaded')
    } catch {
      try {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('CYBERNEX AI — Analysis Report', 14, 20)
        doc.setFontSize(11)
        doc.text(`Prediction: ${rec?.prediction || 'Analysis'}`, 14, 34)
        doc.text(`Risk Score: ${rec?.risk_score ?? 0} / 100 (${rec?.risk_level || 'Low'})`, 14, 42)
        doc.text('Explanation:', 14, 54)
        doc.text(doc.splitTextToSize(rec?.explanation || 'Demo mode sample report.', 180), 14, 62)
        doc.save(`cybernex_${id.slice(0,8)}.pdf`)
        toast.dismiss(tid); toast.success('Demo PDF downloaded')
      } catch {
        toast.dismiss(tid); toast.error('PDF failed')
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-80">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
  if (!rec) return (
    <div className="text-center py-16">
      <p className="text-slate-500">Analysis not found.</p>
      <Link to="/history" className="cx-btn-primary mt-4 inline-flex">Back to History</Link>
    </div>
  )

  const level = rec.risk_level || 'Low'
  const borderC = level==='High'?'rgba(239,68,68,0.25)':level==='Medium'?'rgba(249,115,22,0.25)':'rgba(34,197,94,0.2)'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link to="/history" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <button onClick={downloadPdf} className="cx-btn-secondary text-xs py-2 px-3">
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>

      {/* Header card */}
      <div className="cx-card-glow p-6" style={{ border: `1px solid ${borderC}` }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-white mb-2">{rec.prediction}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <RiskBadge level={level} size="lg" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                {MOD[rec.detection_module] || rec.detection_module}
              </span>
              {rec.fraud_category && rec.fraud_category !== 'Unknown' && (
                <span className="text-xs font-bold text-orange-400">{rec.fraud_category}</span>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Input Type',  val: rec.input_type?.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase()) },
            { label: 'Confidence',  val: rec.confidence ? `${rec.confidence}%` : 'N/A' },
            { label: 'Module',      val: MOD[rec.detection_module]?.split(' ')[0] || rec.detection_module },
            { label: 'Date',        val: rec.created_at ? new Date(rec.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'N/A' },
          ].map(({ label, val }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
              <div className="text-sm font-semibold text-slate-200">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk meter */}
      <div className="cx-card-glow p-6">
        <RiskMeter score={rec.risk_score || 0} />
      </div>

      {/* Content */}
      {rec.input_content && (
        <div className="cx-card-glow p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Submitted Content</div>
          <div className="p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {rec.input_content}
          </div>
        </div>
      )}

      {rec.extracted_text && (
        <div className="cx-card-glow p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Extracted Text (OCR)</span>
          </div>
          <div className="p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {rec.extracted_text}
          </div>
        </div>
      )}

      {/* Indicators */}
      {(rec.suspicious_indicators?.length > 0) && (
        <div className="cx-card-glow p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Threat Indicators</div>
          <IndicatorList indicators={rec.suspicious_indicators || []} />
        </div>
      )}

      {/* Explanation */}
      {rec.explanation && (
        <div className="cx-card-glow p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Analysis Explanation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{rec.explanation}</p>
        </div>
      )}

      {/* Recommendations */}
      {rec.recommendations?.length > 0 && (
        <div className="cx-card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safety Recommendations</span>
          </div>
          <ul className="space-y-2.5">
            {rec.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center py-2">
        <span className="text-[10px] text-slate-700 font-mono">
          Results based on ML heuristics · Educational use only · Not verified threat intelligence
        </span>
      </div>
    </div>
  )
}
