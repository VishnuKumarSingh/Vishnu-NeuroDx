import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Brain, TrendingUp } from 'lucide-react'
import clsx from 'clsx'
import type { CNNResult } from '../types'

interface ResultCardProps {
  result: CNNResult
}

const CLASS_CONFIG: Record<string, { color: string; glow: string; icon: React.ReactNode; severity: string }> = {
  Glioma: {
    color:    'text-red-400',
    glow:     'glow-red',
    icon:     <AlertTriangle size={28} className="text-red-400" />,
    severity: 'High Priority',
  },
  Meningioma: {
    color:    'text-amber-400',
    glow:     'shadow-amber-500/20',
    icon:     <AlertTriangle size={28} className="text-amber-400" />,
    severity: 'Moderate Priority',
  },
  'Pituitary Tumor': {
    color:    'text-orange-400',
    glow:     'shadow-orange-500/20',
    icon:     <Brain size={28} className="text-orange-400" />,
    severity: 'Moderate Priority',
  },
  'No Tumor': {
    color:    'text-green-400',
    glow:     'glow-green',
    icon:     <CheckCircle2 size={28} className="text-green-400" />,
    severity: 'Normal',
  },
}

function ConfidenceBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor =
    value >= 70 ? 'from-green-500 to-emerald-400' :
    value >= 50 ? 'from-amber-500 to-yellow-400' :
                  'from-red-500 to-rose-400'

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 truncate pr-2">{label}</span>
        <span className="text-slate-300 font-mono font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={clsx('h-full rounded-full bg-gradient-to-r', barColor)}
        />
      </div>
    </div>
  )
}

export default function ResultCard({ result }: ResultCardProps) {
  const { predicted_class, confidence, probabilities } = result
  const config = CLASS_CONFIG[predicted_class] ?? CLASS_CONFIG['No Tumor']

  const isTumor = predicted_class !== 'No Tumor'

  // Ring color by confidence
  const ringColor =
    confidence >= 80 ? 'ring-green-500/30' :
    confidence >= 60 ? 'ring-amber-500/30' :
                       'ring-red-500/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 space-y-6"
    >
      {/* ── Diagnosis banner ───────────────────────────────────────────────── */}
      <div className={clsx(
        'rounded-xl p-5 ring-1',
        ringColor,
        isTumor ? 'bg-red-500/5' : 'bg-green-500/5',
      )}>
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
            isTumor ? 'bg-red-500/15' : 'bg-green-500/15',
          )}>
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="section-heading">AI Diagnosis</span>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                isTumor
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'bg-green-500/15 text-green-400 border border-green-500/20',
              )}>
                {config.severity}
              </span>
            </div>

            <h2 className={clsx('text-2xl font-bold', config.color)}>
              {predicted_class}
            </h2>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp size={14} />
              Model Confidence
            </span>
            <span className={clsx('font-bold font-mono text-lg', config.color)}>
              {confidence.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={clsx(
                'h-full rounded-full bg-gradient-to-r',
                confidence >= 80 ? 'from-green-600 to-emerald-400' :
                confidence >= 60 ? 'from-amber-600 to-yellow-400' :
                                   'from-red-600 to-rose-400',
              )}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ── Class probabilities ─────────────────────────────────────────────── */}
      <div>
        <p className="section-heading">All Class Probabilities</p>
        <div className="space-y-3">
          {Object.entries(probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([cls, prob]) => (
              <ConfidenceBar key={cls} label={cls} value={prob} />
            ))}
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
      <p className="text-xs text-slate-600 leading-relaxed border-t border-white/5 pt-4">
        ⚕️ This AI prediction is a screening aid only. Always consult a qualified neurologist
        or radiologist for clinical diagnosis and treatment planning.
      </p>
    </motion.div>
  )
}
