import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Shield, Newspaper, AlertTriangle, Layers, ImageIcon, ArrowRight, Bot, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const features = [
  { icon: Newspaper,    title: 'Fake News Detection',   desc: 'NLP + TF-IDF classifies misinformation with linguistic heuristics', color: '#3b82f6' },
  { icon: Shield,       title: 'Phishing Scanner',      desc: '19-feature URL analysis + text classification detects phishing', color: '#8b5cf6' },
  { icon: AlertTriangle,title: 'Fraud Detection',       desc: '7-category rule engine identifies UPI, job, lottery and loan scams', color: '#f97316' },
  { icon: Layers,       title: 'Cross-Modal AI',        desc: 'Fuses text, URL and image evidence into one unified threat score', color: '#06b6d4' },
  { icon: ImageIcon,    title: 'Image Intelligence',    desc: 'OCR extracts text from screenshots, then runs full AI analysis', color: '#22c55e' },
  { icon: Bot,          title: 'AI Assistant',          desc: 'Instant cybersecurity Q&A and threat guidance chatbot', color: '#a78bfa' },
]

export default function LandingPage() {
  const { demoLogin, user } = useAuth()
  const navigate = useNavigate()
  const [entering, setEntering] = useState(false)

  const handleTryDemo = async () => {
    if (user) {
      navigate('/dashboard')
      return
    }
    setEntering(true)
    try {
      await demoLogin()
      toast.success('Demo Mode activated!')
      navigate('/dashboard')
    } catch {
      navigate('/login')
    } finally {
      setEntering(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#02040f', color: '#e2e8f0' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(2,4,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm tracking-wider text-white">CYBERNEX<span className="text-blue-400"> AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/about" className="cx-btn-secondary text-xs py-2 px-4">About</Link>
          <Link to="/login" className="cx-btn-secondary text-xs py-2 px-4">Sign In</Link>
          <button
            type="button"
            onClick={handleTryDemo}
            disabled={entering}
            className="cx-btn-primary text-xs py-2 px-4"
          >
            <Sparkles className="w-3 h-3" /> {entering ? 'Loading…' : 'Live Demo'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-blue-400 mb-8"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Zap className="w-3 h-3" /> AI-Powered Unified Threat Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none">
            <span className="text-white">CYBERNEX</span>
            <br />
            <span className="text-gradient-cyber">AI PLATFORM</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Detect fake news, phishing attacks, and digital fraud in real time.
            One unified AI platform combining text, URL, and image intelligence.
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-10">
            Final-year engineering project · ML-powered heuristics · Educational use only
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleTryDemo}
              disabled={entering}
              className="cx-btn-primary px-8 py-3 text-sm"
            >
              <Sparkles className="w-4 h-4" /> {entering ? 'Launching Demo…' : 'Try Live Demo'}
            </button>
            <Link to="/register" className="cx-btn-secondary px-8 py-3 text-sm">
              Launch Platform <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="cx-btn-secondary px-8 py-3 text-sm">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 py-8 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '5', label: 'Detection Modules' },
            { n: '19', label: 'URL Features Analysed' },
            { n: '7', label: 'Fraud Categories' },
            { n: '100%', label: 'Real ML Inference' },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-gradient-blue">{n}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center text-white mb-3">Intelligence Modules</h2>
        <p className="text-center text-slate-500 mb-12 text-sm">Each module uses real AI inference — no hardcoded predictions</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="cx-card p-6 group hover:scale-[1.01] transition-transform cursor-default">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto cx-card-glow p-12">
          <Zap className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-3">Ready to Analyse?</h2>
          <p className="text-slate-400 mb-8 text-sm">Create a free account and start scanning threats in seconds.</p>
          <Link to="/register" className="cx-btn-primary px-10 py-3">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-700 font-mono border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        CYBERNEX AI · Unified Threat Intelligence Platform · Final Year Engineering Project · Educational Use Only
      </footer>
    </div>
  )
}
