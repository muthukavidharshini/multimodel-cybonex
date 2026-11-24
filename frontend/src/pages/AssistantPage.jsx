import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Zap, AlertCircle } from 'lucide-react'

// Local AI assistant — answers cybersecurity questions using rule-based logic
// No external API needed — works fully offline
const KB = [
  { q: ['what is phishing','phishing','phishing attack'], a: 'Phishing is a cyberattack where criminals impersonate trusted organisations via email, SMS or fake websites to steal credentials, OTPs or financial data. Key signs: urgency, generic greetings, suspicious URLs, requests for sensitive information.' },
  { q: ['what is fake news','fake news','misinformation','disinformation'], a: 'Fake news is fabricated or misleading content designed to deceive. It often uses sensational language, lacks credible sourcing, and spreads via social media. CYBERNEX AI detects it by analysing linguistic patterns — but cannot verify factual claims.' },
  { q: ['upi scam','upi fraud','payment scam','gpay','phonepe scam'], a: 'UPI scams involve fraudsters requesting OTPs, PINs or small "processing fees" to unlock prize money or unblock accounts. Remember: legitimate entities NEVER ask for your UPI PIN or OTP. Use only official apps.' },
  { q: ['job scam','work from home','job fraud','earn daily'], a: 'Job scams promise high daily earnings with no experience, then charge a registration or training fee. Legitimate employers never ask for advance payments. Verify vacancies on official company websites.' },
  { q: ['lottery scam','lottery','prize scam','you won','winner'], a: 'If you receive a message claiming you won a lottery you never entered, it is a scam. No legitimate lottery asks for an advance processing fee. Delete the message and report it to cybercrime.gov.in.' },
  { q: ['how does the ai work','how ai works','how does cybernex work','methodology'], a: 'CYBERNEX AI uses three ML pipelines: (1) Fake News — TF-IDF + Logistic Regression on article text. (2) Phishing — Random Forest on 19 URL features. (3) Fraud — Random Forest + TF-IDF on message text. Cross-modal fusion combines scores using a weighted average (URL×1.2, text×1.0, OCR×0.8).' },
  { q: ['what is cross modal','cross modal','multimodal'], a: 'Cross-modal analysis combines evidence from multiple input types — text, URLs, and OCR-extracted image text — into one unified threat score. Each modality is scored independently, then combined using a documented weighted average. This prevents fabricated combined scores.' },
  { q: ['ocr','image analysis','screenshot analysis'], a: 'The Image Intelligence module uses EasyOCR (with OpenCV preprocessing) to extract text from uploaded screenshots. The extracted text and any URLs are then sent through the cross-modal AI engine for threat analysis.' },
  { q: ['safe url','is this url safe','check url'], a: 'To check a URL for phishing, use the Phishing Scanner page. Enter the full URL — the system analyses 19 features including domain entropy, TLD risk, URL length, HTTPS status, subdomain count and suspicious keywords. Note: HTTPS alone does not confirm safety.' },
  { q: ['report fraud','report scam','cybercrime','helpline'], a: 'Report cybercrime in India at: cybercrime.gov.in or call 1930 (National Cyber Crime Helpline). For bank fraud, immediately call your bank\'s 24×7 helpline. Act within the first few hours for the best chance of recovery.' },
  { q: ['protect yourself','stay safe','tips','safety tips'], a: 'Key cybersecurity practices: (1) Never share OTP, PIN or password with anyone. (2) Verify URLs before clicking — hover to see the real destination. (3) Use 2FA on all important accounts. (4) Be sceptical of urgency — scammers use time pressure to override judgement. (5) Cross-check news before sharing.' },
  { q: ['hello','hi','hey','good morning','good evening'], a: 'Hello! I\'m CYBERNEX AI Assistant. Ask me about phishing, fake news, digital fraud, how the AI works, or cybersecurity best practices. I\'ll do my best to help.' },
  { q: ['help','what can you do','features','capabilities'], a: 'I can answer questions about: phishing attacks · fake news detection · UPI/job/lottery scams · how the AI models work · cross-modal analysis · OCR image intelligence · cybersecurity best practices · reporting cybercrime. What would you like to know?' },
]

function getResponse(input) {
  const q = input.toLowerCase().trim()
  for (const item of KB) {
    if (item.q.some(kw => q.includes(kw))) return item.a
  }
  if (q.length < 4) return 'Could you elaborate? I need a bit more context to give you a useful answer.'
  return `I don't have specific information about "${input.slice(0, 40)}". Try asking about: phishing, fake news, UPI scams, job scams, lottery fraud, how the AI models work, or general cybersecurity tips.`
}

export default function AssistantPage() {
  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: "Hello! I'm the CYBERNEX AI Security Assistant. I can answer questions about phishing, fake news, digital fraud, and how the AI models work. What would you like to know?", time: new Date() }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, thinking])

  const send = () => {
    const q = input.trim(); if (!q) return
    setMsgs(m => [...m, { role: 'user', text: q, time: new Date() }])
    setInput(''); setThinking(true)
    setTimeout(() => {
      setMsgs(m => [...m, { role: 'assistant', text: getResponse(q), time: new Date() }])
      setThinking(false)
    }, 600 + Math.random() * 400)
  }

  const PROMPTS = ['How does fake news detection work?', 'What are signs of a phishing URL?', 'How to report a UPI scam?', 'What is cross-modal analysis?']

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}>
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">AI Security Assistant</h1>
          <p className="text-slate-500 text-xs mt-0.5">Offline knowledge base · No external API required</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-green-400"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> ONLINE
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <AlertCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-500">Rule-based local assistant. Answers from built-in knowledge base. Not connected to live threat intelligence or external AI APIs.</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 mb-4">
        {msgs.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-600 to-violet-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-tr-sm text-white'
                : 'rounded-tl-sm text-slate-200'
            }`} style={msg.role === 'user'
              ? { background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
            }>
              {msg.text}
              <div className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-blue-200/60' : 'text-slate-600'}`}>
                {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {msgs.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {PROMPTS.map(p => (
            <button key={p} onClick={() => { setInput(p); }} className="text-[10px] px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input className="cx-input flex-1 text-sm" placeholder="Ask about phishing, fake news, fraud patterns…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
        <button onClick={send} disabled={!input.trim() || thinking} className="cx-btn-primary px-4 py-2.5">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
