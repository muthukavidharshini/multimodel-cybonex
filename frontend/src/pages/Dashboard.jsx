import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dashboardAPI } from '../services/api'
import { getDemoDashboardData } from '../services/demoData'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import {
  Newspaper, Shield, AlertTriangle, Layers,
  Activity, AlertCircle, ChevronRight, TrendingUp, Zap, Bot, ImageIcon
} from 'lucide-react'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

const MOD = { fake_news:'Fake News', phishing:'Phishing', digital_fraud:'Digital Fraud', cross_modal:'Cross-Modal', image:'Image' }
const PIE_COLORS = ['#3b82f6','#8b5cf6','#f97316','#06b6d4','#22c55e']

const ChartTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="text-xs rounded-xl px-3 py-2" style={{ background: '#0d1530', border: '1px solid rgba(59,130,246,0.3)' }}>
    <div className="text-slate-400 mb-0.5">{label}</div>
    <div className="text-blue-300 font-bold">{payload[0].value} scans</div>
  </div>
) : null

export default function Dashboard() {
  const { user, demoMode } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.stats()
      .then(r => setData(r.data.data))
      .catch(() => {
        if (demoMode) {
          setData(getDemoDashboardData(user))
        } else {
          toast.error('Could not load dashboard. Is the backend running?')
        }
      })
      .finally(() => setLoading(false))
  }, [demoMode, user])

  const stats = data?.stats || {}
  const weekly = data?.weekly_activity || []
  const recent = data?.recent_analyses || []

  const weeklyMap = {}
  weekly.forEach(w => { weeklyMap[w._id] = w.count })
  const today = new Date()
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return { day: key.slice(5), count: weeklyMap[key] || 0 }
  })

  const pieData = [
    { name: 'Fake News',     value: stats.fake_news || 0 },
    { name: 'Phishing',      value: stats.phishing || 0 },
    { name: 'Digital Fraud', value: stats.digital_fraud || 0 },
    { name: 'Cross-Modal',   value: stats.cross_modal || 0 },
    { name: 'Image',         value: stats.image || 0 },
  ].filter(d => d.value > 0)

  const cards = [
    { label: 'Total Analyses', val: stats.total || 0,         icon: Activity,       c1: '#3b82f6', c2: '#6366f1' },
    { label: 'Fake News',      val: stats.fake_news || 0,     icon: Newspaper,      c1: '#0ea5e9', c2: '#06b6d4' },
    { label: 'Phishing',       val: stats.phishing || 0,      icon: Shield,         c1: '#8b5cf6', c2: '#a78bfa' },
    { label: 'Fraud Cases',    val: stats.digital_fraud || 0, icon: AlertTriangle,  c1: '#f97316', c2: '#ef4444' },
    { label: 'Cross-Modal',    val: stats.cross_modal || 0,   icon: Layers,         c1: '#06b6d4', c2: '#22c55e' },
    { label: 'High Risk',      val: stats.high_risk || 0,     icon: AlertCircle,    c1: '#ef4444', c2: '#dc2626' },
  ]

  const totalCount = Math.max(stats.total || 0, 1)
  const highRisk = stats.high_risk || 0
  const mediumRisk = stats.medium_risk ?? Math.max(0, Math.round((stats.total || 0) * 0.33))
  const lowRisk = stats.low_risk ?? Math.max(0, (stats.total || 0) - highRisk - mediumRisk)

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome, <span className="text-gradient-blue">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Threat Intelligence Overview · CYBERNEX AI {(demoMode || data?.demo_mode) ? '· Temporary Sample Data' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/assistant" className="cx-btn-secondary text-xs py-2 px-3">
            <Bot className="w-3.5 h-3.5" /> AI Assistant
          </Link>
          <Link to="/fake-news" className="cx-btn-primary text-xs py-2 px-3">
            <Zap className="w-3.5 h-3.5" /> New Scan
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map(({ label, val, icon: Icon, c1, c2 }) => (
          <div key={label} className="cx-card p-4 text-center group hover:border-blue-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${c1}25, ${c2}25)`, border: `1px solid ${c1}30` }}>
              <Icon className="w-5 h-5" style={{ color: c1 }} />
            </div>
            <div className="text-2xl font-black text-white">{val}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Area chart — 7 day */}
        <div className="cx-card-glow p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">7-Day Scan Activity</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#1e3170" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#1e3170" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="cx-card-glow p-5 lg:col-span-2">
          <div className="text-sm font-semibold text-white mb-5">Detection Distribution</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={6}
                  formatter={v => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#0d1530', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
              <Activity className="w-8 h-8 opacity-30" />
              <span>No data yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Overview */}
      <div className="cx-card-glow p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white">Risk Overview</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {(demoMode || data?.demo_mode) ? 'Sample Risk Distribution (Non-persistent)' : 'Account Risk Breakdown'}
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'High Risk Threats', count: highRisk, color: '#ef4444' },
            { label: 'Medium Risk / Suspicious', count: mediumRisk, color: '#f97316' },
            { label: 'Low Risk / Safe', count: lowRisk, color: '#22c55e' },
          ].map(({ label, count, color }) => {
            const pct = stats.total ? Math.round((count / totalCount) * 100) : 0
            return (
              <div key={label} className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">{label}</span>
                  <span className="text-sm font-black" style={{ color }}>{count} ({pct}%)</span>
                </div>
                <div className="cx-progress-track h-2">
                  <div className="cx-progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick launch + recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick launch */}
        <div className="cx-card-glow p-5">
          <div className="text-sm font-semibold text-white mb-4">Quick Scan</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { to: '/fake-news',      icon: Newspaper,       label: 'Fake News',   c: '#3b82f6' },
              { to: '/phishing',       icon: Shield,          label: 'Phishing',    c: '#8b5cf6' },
              { to: '/fraud',          icon: AlertTriangle,   label: 'Fraud',       c: '#f97316' },
              { to: '/cross-modal',    icon: Layers,          label: 'Cross-Modal', c: '#06b6d4' },
              { to: '/image-analysis', icon: ImageIcon,       label: 'Image OCR',   c: '#22c55e' },
              { to: '/assistant',      icon: Bot,             label: 'AI Chat',     c: '#a78bfa' },
            ].map(({ to, icon: Icon, label, c }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2.5 p-3 rounded-xl transition-all group hover:scale-[1.02]"
                style={{ background: `${c}0d`, border: `1px solid ${c}25` }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: c }} />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white">{label}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent scans */}
        <div className="cx-card-glow p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">Recent Detection Activity</span>
            <Link to="/history" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          {recent.length > 0 ? (
            <div className="space-y-2">
              {recent.map(item => (
                <Link key={item._id} to={`/results/${item._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 group">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300 group-hover:text-white truncate transition-colors">
                      {item.prediction || 'Analysis'}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {MOD[item.detection_module] || item.detection_module}
                      </span>
                      {item.created_at && new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-black" style={{
                      color: (item.risk_score || 0) >= 65 ? '#ef4444' : (item.risk_score || 0) >= 35 ? '#f97316' : '#22c55e'
                    }}>{(item.risk_score || 0).toFixed(0)}</span>
                    <RiskBadge level={item.risk_level || 'Low'} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No scans yet.</p>
              <Link to="/fake-news" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                Run your first scan →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
