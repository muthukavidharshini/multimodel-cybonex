import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { historyAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getDemoHistory } from '../services/demoData'
import { History, Trash2, ExternalLink, Search } from 'lucide-react'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

const MOD = { fake_news:'Fake News', phishing:'Phishing', digital_fraud:'Digital Fraud', cross_modal:'Cross-Modal', image:'Image' }
const MOD_COLOR = { fake_news:'#3b82f6', phishing:'#8b5cf6', digital_fraud:'#f97316', cross_modal:'#06b6d4', image:'#22c55e' }

export default function HistoryPage() {
  const { demoMode } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    historyAPI.getAll({ limit: 100 })
      .then(r => setItems(r.data.data?.history || []))
      .catch(err => {
        if (demoMode) {
          setItems(getDemoHistory())
        } else {
          toast.error(err.response?.data?.message || 'Failed to load history')
        }
      })
      .finally(() => setLoading(false))
  }, [demoMode])

  const del = async (id) => {
    try {
      await historyAPI.delete(id)
      setItems(p => p.filter(i => i._id !== id))
      toast.success(demoMode ? 'Removed from view (Demo Mode)' : 'Deleted')
    } catch {
      if (demoMode) {
        setItems(p => p.filter(i => i._id !== id))
        toast.success('Removed from demo view')
      } else {
        toast.error('Delete failed')
      }
    }
  }

  const filtered = items.filter(i => {
    const matchSearch = !search ||
      i.prediction?.toLowerCase().includes(search.toLowerCase()) ||
      MOD[i.detection_module]?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || i.detection_module === filter
    return matchSearch && matchFilter
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-80">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1e40af, #6366f1)', boxShadow: '0 0 20px rgba(30,64,175,0.3)' }}>
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Scan History</h1>
          <p className="text-slate-500 text-xs mt-0.5">{items.length} total records</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="cx-input pl-9 text-sm" placeholder="Search predictions or modules…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="cx-select text-sm w-44" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Modules</option>
          {Object.entries(MOD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="cx-card-glow p-16 text-center">
          <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {items.length === 0 ? 'No scans yet. Run your first analysis!' : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const sc = item.risk_score || 0
            const color = sc >= 65 ? '#ef4444' : sc >= 35 ? '#f97316' : '#22c55e'
            const mc = MOD_COLOR[item.detection_module] || '#64748b'
            return (
              <div key={item._id} className="cx-card flex items-center gap-4 p-4 hover:border-blue-500/20 transition-all">
                {/* Module color dot */}
                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: mc }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                      {item.prediction || 'Analysis'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: `${mc}18`, color: mc, border: `1px solid ${mc}30` }}>
                      {MOD[item.detection_module] || item.detection_module}
                    </span>
                    {item.fraud_category && item.fraud_category !== 'Unknown' && (
                      <span className="text-[10px] text-orange-400 font-semibold">{item.fraud_category}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 truncate font-mono">
                    {item.input_content?.slice(0, 70)}
                    {item.created_at && ` · ${new Date(item.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}`}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-black" style={{ color }}>{sc.toFixed(0)}</span>
                  <RiskBadge level={item.risk_level || 'Low'} />
                  <Link to={`/results/${item._id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                  <button onClick={() => del(item._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
