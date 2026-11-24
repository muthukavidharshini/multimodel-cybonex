import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Newspaper, Shield, AlertTriangle, Layers,
  ImageIcon, History, User, Info, LogOut, Menu, X,
  Bot, Settings, ChevronRight, Bell, Search, Zap
} from 'lucide-react'

const NAV = [
  { section: 'OVERVIEW' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Overview',           badge: null },
  { section: 'DETECTION' },
  { to: '/fake-news',      icon: Newspaper,       label: 'Fake News',          badge: null },
  { to: '/phishing',       icon: Shield,          label: 'Phishing Scanner',   badge: null },
  { to: '/fraud',          icon: AlertTriangle,   label: 'Fraud Detection',    badge: null },
  { section: 'INTELLIGENCE' },
  { to: '/image-analysis', icon: ImageIcon,       label: 'Image Intelligence', badge: null },
  { to: '/cross-modal',    icon: Layers,          label: 'Cross-Modal AI',     badge: 'AI' },
  { to: '/assistant',      icon: Bot,             label: 'AI Assistant',       badge: 'NEW' },
  { section: 'ACCOUNT' },
  { to: '/history',        icon: History,         label: 'Scan History',       badge: null },
  { to: '/profile',        icon: User,            label: 'Profile',            badge: null },
  { to: '/settings',       icon: Settings,        label: 'Settings',           badge: null },
]

function CybernexLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 flex-shrink-0">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white drop-shadow" />
        </div>
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 opacity-30 blur-sm" />
      </div>
      <div>
        <div className="font-black text-sm tracking-wider text-white leading-none">CYBERNEX</div>
        <div className="text-[10px] font-medium tracking-widest text-blue-400/80 leading-none mt-0.5">AI PLATFORM</div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-cyber-950" style={{ background: '#02040f' }}>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col w-60
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: '#040812', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <CybernexLogo />
          <button className="lg:hidden text-slate-500 hover:text-white transition-colors" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} className="cx-nav-section">{item.section}</div>
            )
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`cx-nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.badge === 'NEW'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  }`}>{item.badge}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
              flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-500 truncate">
                {demoMode ? 'Demo Session (No DB)' : (user?.email || '')}
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="cx-nav-link w-full text-red-400/80 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col lg:ml-60">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-4 md:px-6 py-3"
          style={{
            background: 'rgba(2,4,15,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)'
          }}>
          <button onClick={() => setOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile brand */}
          <div className="lg:hidden flex-1">
            <CybernexLogo />
          </div>

          {/* Desktop spacer */}
          <div className="hidden lg:flex flex-1 items-center gap-2">
            <div className="text-xs text-slate-500 font-mono">
              {new Date().toLocaleString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {demoMode && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-amber-300"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                DEMO MODE
              </div>
            )}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-green-400"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Systems Online
            </div>
            <NavLink to="/assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Chat</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[10px] text-slate-600 font-mono">
            CYBERNEX AI — Unified Threat Intelligence Platform · Educational Project
          </span>
        </footer>
      </div>
    </div>
  )
}
