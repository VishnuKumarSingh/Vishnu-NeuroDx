import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, FolderOpen, X, Download, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { useScans } from '../hooks/useScans'
import { downloadReport } from '../services/api'
import toast from 'react-hot-toast'
import type { ScanRecord } from '../types'
import clsx from 'clsx'

export default function History() {
  const { t, lang }   = useLang()
  const { scans, clearScans } = useScans()
  const navigate      = useNavigate()
  const [selected, setSelected] = useState<ScanRecord | null>(null)
  const [downloading, setDownloading] = useState(false)

  const sorted = scans.slice().reverse()

  async function handleDownload(scan: ScanRecord) {
    setDownloading(true)
    const id = toast.loading(t('pdf_generating'))
    try {
      await downloadReport({
        patient_name:  'Anonymous',
        patient_age:   null,
        prediction:    {
          predicted_class: scan.tumorClass,
          confidence:      scan.confidence,
          probabilities:   { [scan.tumorClass]: scan.confidence },
        },
        ml_results:    {},
        gradcam_image: scan.gradcam_image || '',
        original_image: scan.original_image || '',
        explanation:   scan.recommendation,
      })
      toast.success(t('report_downloaded'), { id })
    } catch {
      toast.error(t('download_failed'), { id })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-heading">{t('past_scans')}</p>
          <h1 className="text-2xl font-extrabold text-white">
            {t('reports')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('all_mri_reports')}
          </p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear all scan history?')) clearScans() }}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {t('clear_all')}
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card py-20 text-center space-y-3">
          <FolderOpen size={52} className="mx-auto text-slate-600" />
          <p className="font-semibold text-slate-400">
            {t('no_reports')}
          </p>
          <p className="text-sm text-slate-500">
            {t('first_mri')}
          </p>
          <button onClick={() => navigate('/diagnose')} className="btn-primary mt-2">
            {t('new_scan')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((scan, i) => (
            <motion.div key={scan.caseId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(scan)}
              className="glass-card-hover p-5 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  scan.result === 'detected' ? 'bg-red-500/15' : 'bg-teal-500/15',
                )}>
                  <Brain size={22} className={scan.result === 'detected' ? 'text-red-400' : 'text-teal-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white truncate">{scan.filename}</p>
                    <span className={clsx(
                      'text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0',
                      scan.result === 'detected'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
                    )}>
                      {scan.result === 'detected' ? t('tumor_found') : t('no_tumor')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {scan.caseId} · {new Date(scan.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold font-mono text-white">{scan.confidence.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">{t('confidence')}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="glass-card p-7 max-w-lg w-full space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-lg">
                  {t('report_detail')}
                </h3>
                <button onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Images */}
              {(selected.original_image || selected.gradcam_image) && (
                <div className="grid grid-cols-2 gap-3">
                  {selected.original_image && (
                    <div>
                      <img src={selected.original_image} alt="MRI" className="w-full h-36 object-contain rounded-xl bg-black/30" />
                      <p className="text-center text-xs text-slate-500 mt-1">Original MRI</p>
                    </div>
                  )}
                  {selected.gradcam_image && (
                    <div>
                      <img src={selected.gradcam_image} alt="Heatmap" className="w-full h-36 object-contain rounded-xl bg-black/30" />
                      <p className="text-center text-xs text-slate-500 mt-1">Grad-CAM</p>
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Case ID</span>
                  <span className="text-white font-mono">{selected.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('date')}</span>
                  <span className="text-white">{new Date(selected.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('result')}</span>
                  <span className={selected.result === 'detected' ? 'text-red-400 font-bold' : 'text-teal-400 font-bold'}>
                    {selected.result === 'detected' ? t('tumor_found') : t('no_tumor')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('confidence')}</span>
                  <span className="text-white font-mono">{selected.confidence.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/8 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('recommendation')}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{selected.recommendation}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selected)}
                  disabled={downloading}
                  className="btn-primary flex items-center gap-2 text-sm flex-1 justify-center"
                >
                  <Download size={15} />
                  {t('download_report')}
                </button>
                <button
                  onClick={() => { setSelected(null); navigate('/chat') }}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <MessageSquare size={15} />
                  {t('ask_ai_text')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
