import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Shield, Newspaper, AlertTriangle, Layers, ImageIcon, Bot, ArrowRight, ArrowLeft, Database, Code } from 'lucide-react'

const modules = [
  { icon: Newspaper, title: 'Fake News Detection', color: '#3b82f6', desc: 'TF-IDF + Logistic Regression. Analyses linguistic style, sensational vocabulary, credibility markers, and clickbait patterns.' },
  { icon: Shield,    title: 'Phishing Scanner',    color: '#8b5cf6', desc: 'Random Forest on 19 URL features: entropy, TLD risk, HTTPS, hyphens, IP detection, keyword matching, subdomain count.' },
  { icon: AlertTriangle, title: 'Fraud Detection', color: '#f97316', desc: '7-category rule engine + Random Forest on TF-IDF text features. Detects UPI, job, lottery, investment and loan scams.' },
  { icon: Layers,    title: 'Cross-Modal AI',      color: '#06b6d4', desc: 'Weighted score fusion: URL (1.2×) + text (1.0×) + OCR (0.8×). Each modality scored independently to prevent fabrication.' },
  { icon: ImageIcon, title: 'Image Intelligence',  color: '#22c55e', desc: 'EasyOCR with OpenCV preprocessing extracts text from screenshots. Extracted content fed to cross-modal engine.' },
  { icon: Bot,       title: 'AI Assistant',        color: '#a78bfa', desc: 'Offline rule-based chatbot with cybersecurity knowledge base. Answers questions about threats, scams and safe practices.' },
]

const stack = [
  { cat: 'Frontend',  items: ['React.js', 'Vite', 'Tailwind CSS', 'Recharts', 'Lucide Icons', 'React Router'] },
  { cat: 'Backend',   items: ['Python 3.14', 'Flask', 'Flask-JWT', 'Flask-CORS', 'Flask-Limiter'] },
  { cat: 'AI / ML',   items: ['scikit-learn', 'TF-IDF', 'Logistic Regression', 'Random Forest', 'NLTK'] },
  { cat: 'Vision',    items: ['EasyOCR', 'OpenCV', 'Pillow'] },
  { cat: 'Database',  items: ['MongoDB', 'PyMongo', 'JWT Auth', 'bcrypt'] },
  { cat: 'Reports',   items: ['ReportLab PDF', 'tldextract', 'URL heuristics'] },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 animate-fade-in" style={{ color: '#e2e8f0' }}>
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center shadow-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">CYBERNEX AI</h1>
        <p className="text-xl font-semibold text-gradient-cyber mb-4">Unified Threat Intelligence Platform</p>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          A final-year engineering project demonstrating cross-modal AI fusion for unified cybersecurity threat detection
          across fake news, phishing, and digital fraud — combining text, URL, and image analysis.
        </p>
      </div>

      {/* Abstract */}
      <div className="cx-card-glow p-8">
        <h2 className="text-lg font-black text-white mb-4">Abstract</h2>
        <div className="text-sm text-slate-400 space-y-3 leading-relaxed">
          <p>Digital misinformation, phishing attacks, and online fraud represent three of the most pervasive cybersecurity threats facing individuals today. Existing tools typically address these problems in isolation.</p>
          <p>CYBERNEX AI presents a unified framework combining three independent ML detection modules with a Cross-Modal Intelligence Engine that fuses evidence from text, URLs, and OCR-extracted image content using a documented weighted score fusion strategy.</p>
          <p className="text-slate-600 italic text-xs">All predictions are based on pattern analysis and heuristics. Results should supplement — not replace — human judgement and official security advice.</p>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-lg font-black text-white mb-5">System Modules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map(({ icon: Icon, title, color, desc }) => (
            <div key={title} className="cx-card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div>
        <h2 className="text-lg font-black text-white mb-5">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stack.map(({ cat, items }) => (
            <div key={cat} className="cx-card p-4">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">{cat}</div>
              <ul className="space-y-1.5">
                {items.map(it => (
                  <li key={it} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />{it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="cx-card p-6" style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)' }}>
        <h2 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Limitations & Ethical Notes</h2>
        <ul className="space-y-2 text-xs text-slate-400">
          {[
            'Predictions are based on linguistic patterns — not factual verification.',
            'HTTPS alone is insufficient to classify a URL as safe.',
            'No trained models shipped — system uses heuristics until datasets are provided and models are trained.',
            'This system does not connect to live threat intelligence feeds or banking APIs.',
            'Results should supplement, not replace, human judgement and official security advice.',
          ].map(l => <li key={l} className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">·</span>{l}</li>)}
        </ul>
      </div>

      <div className="text-center">
        <Link to="/register" className="cx-btn-primary px-10 py-3 inline-flex">
          Try CYBERNEX AI <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
