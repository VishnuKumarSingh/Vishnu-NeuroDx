import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import type { AppState } from '../types'

const STATE_LABELS: Record<AppState, string> = {
  idle:       '',
  uploading:  'Uploading image…',
  predicting: 'Running AI inference…',
  explaining: 'Generating clinical impression…',
  done:       'Analysis complete',
  error:      'An error occurred',
}

const STATE_SUBTEXT: Partial<Record<AppState, string>> = {
  predicting: 'CNN · Grad-CAM · SVM · Random Forest',
  explaining: 'Consulting generative AI model…',
}

interface LoadingOverlayProps {
  state: AppState
}

const steps = [
  { key: 'uploading',  label: 'Image Upload' },
  { key: 'predicting', label: 'AI Inference' },
  { key: 'explaining', label: 'AI Explanation' },
]

const ORDER = ['uploading', 'predicting', 'explaining', 'done']

function stepStatus(stepKey: string, current: AppState) {
  const si = ORDER.indexOf(stepKey)
  const ci = ORDER.indexOf(current)
  if (si < ci) return 'done'
  if (si === ci) return 'active'
  return 'pending'
}

export default function LoadingOverlay({ state }: LoadingOverlayProps) {
  if (state === 'idle' || state === 'done' || state === 'error') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-10 flex flex-col items-center gap-8 max-w-sm w-full mx-4"
      >
        {/* Pulsing brain icon */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-blue-500"
            style={{ filter: 'blur(20px)' }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 flex items-center justify-center"
          >
            <Brain size={36} className="text-white" />
          </motion.div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-white"
          >
            {STATE_LABELS[state]}
          </motion.p>
          {STATE_SUBTEXT[state] && (
            <p className="text-xs text-slate-400">{STATE_SUBTEXT[state]}</p>
          )}
        </div>

        {/* Step indicator */}
        <div className="w-full space-y-3">
          {steps.map(step => {
            const status = stepStatus(step.key, state)
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={[
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  status === 'done'    ? 'bg-green-500 text-white' :
                  status === 'active'  ? 'bg-blue-500 text-white animate-pulse' :
                                         'bg-white/10 text-slate-500',
                ].join(' ')}>
                  {status === 'done' ? '✓' : status === 'active' ? '●' : '○'}
                </div>
                <div className="flex-1">
                  <div className={[
                    'h-1 rounded-full transition-all duration-700',
                    status === 'done'   ? 'bg-green-500' :
                    status === 'active' ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' :
                                          'bg-white/10',
                  ].join(' ')} />
                </div>
                <span className={[
                  'text-xs font-medium w-28',
                  status === 'done'   ? 'text-green-400' :
                  status === 'active' ? 'text-blue-300' :
                                        'text-slate-500',
                ].join(' ')}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
