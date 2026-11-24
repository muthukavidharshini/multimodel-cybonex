import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, Upload, X, Eye, AlertCircle } from 'lucide-react'
import { detectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { simulateDemoCrossModal } from '../services/demoData'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import toast from 'react-hot-toast'

export default function ImageAnalysisPage() {
  const { demoMode } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((acc, rej) => {
    if (rej.length) { toast.error('Invalid file. Use JPG/PNG/WEBP under 10MB'); return }
    const f = acc[0]; setFile(f); setResult(null)
    const r = new FileReader(); r.onload = e => setPreview(e.target.result); r.readAsDataURL(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024
  })

  const analyse = async () => {
    if (!file) { toast.error('Upload an image first'); return }
    setLoading(true); setResult(null)
    try {
      const fd = new FormData(); fd.append('image', file)
      const r = await detectAPI.image(fd)
      setResult(r.data.data)
    } catch (err) {
      if (demoMode && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        const sampleText = '[DEMO SAMPLE OCR] URGENT: Your KYC expires today. Verify OTP at http://secure-kyc-update.tk/verify'
        const sampleUrl = 'http://secure-kyc-update.tk/verify'
        const sim = simulateDemoCrossModal({ text: sampleText, url: sampleUrl })
        setResult({
          ...sim,
          extracted_text: sampleText,
          extracted_urls: [sampleUrl],
          ocr: { confidence: 91.5, method: 'demo_ocr_sample' },
        })
      } else {
        const m = err.response?.data?.message || 'Image analysis failed'
        toast.error(m.includes('EasyOCR') ? 'Install EasyOCR: pip install easyocr' : m)
      }
    } finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null) }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)', boxShadow: '0 0 20px rgba(13,148,136,0.3)' }}>
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Image Intelligence</h1>
          <p className="text-slate-500 text-xs mt-0.5">EasyOCR text extraction + cross-modal threat analysis</p>
        </div>
      </div>

      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.2)' }}>
        <AlertCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Upload a screenshot. OCR extracts text and URLs, then cross-modal AI analyses the extracted content.
          Requires EasyOCR installed in the backend venv.
        </p>
      </div>

      <div className="cx-card-glow p-6 space-y-5">
        {!file ? (
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-teal-400/60 bg-teal-400/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}>
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-white font-semibold">{isDragActive ? 'Drop it here' : 'Drag & drop image'}</p>
            <p className="text-slate-500 text-sm mt-1">JPG · JPEG · PNG · WEBP · Max 10 MB</p>
            <p className="text-slate-600 text-xs mt-2">or click to browse</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10">
              <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" />
              <button onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/70 hover:bg-black flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>
        )}

        <button onClick={analyse} disabled={!file || loading} className="cx-btn-primary w-full py-3">
          {loading ? 'Extracting & Analysing…' : 'Extract Text & Analyse'}
        </button>
      </div>

      {loading && <LoadingSpinner message="Running OCR + cross-modal analysis…" sub="EasyOCR extracting text → AI models scoring threat level" />}

      {result && !loading && (
        <>
          {result.extracted_text && (
            <div className="cx-card-glow p-5">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-semibold text-white">Extracted Text</span>
                {result.ocr?.confidence && (
                  <span className="text-[10px] text-slate-500 ml-auto">OCR confidence: {result.ocr.confidence}%</span>
                )}
              </div>
              <div className="p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {result.extracted_text}
              </div>
              {result.extracted_urls?.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-2">URLs Found</div>
                  <div className="flex flex-wrap gap-2">
                    {result.extracted_urls.map((u, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg font-mono"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                        {u.slice(0, 60)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.ocr?.error && (
                <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {result.ocr.error}
                </p>
              )}
            </div>
          )}
          <ResultCard result={{ ...result, prediction: result.final_label || result.prediction }} />
        </>
      )}
    </div>
  )
}
