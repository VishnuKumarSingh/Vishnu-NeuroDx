import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Eye, EyeOff, Info } from 'lucide-react'
import clsx from 'clsx'

interface HeatmapViewerProps {
  originalImage: string   // base64 data URI
  gradcamImage: string    // base64 data URI
}

type ViewMode = 'side-by-side' | 'overlay' | 'heatmap-only'

export default function HeatmapViewer({ originalImage, gradcamImage }: HeatmapViewerProps) {
  const [mode, setMode] = useState<ViewMode>('side-by-side')
  const [opacity, setOpacity] = useState(80)
  const [showInfo, setShowInfo] = useState(false)

  const MODES: { key: ViewMode; label: string }[] = [
    { key: 'side-by-side', label: 'Side by Side' },
    { key: 'overlay',      label: 'Overlay' },
    { key: 'heatmap-only', label: 'Heatmap' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          <h3 className="font-semibold text-white">Grad-CAM Visualization</h3>
          <button
            onClick={() => setShowInfo(v => !v)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Info"
          >
            <Info size={14} />
          </button>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-200',
                mode === m.key
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-xs text-slate-300 leading-relaxed"
        >
          <strong className="text-purple-300">Grad-CAM</strong> (Gradient-weighted Class Activation Mapping)
          highlights regions in the MRI scan that most influenced the AI's prediction.
          <span className="text-red-400 font-medium"> Red/yellow areas</span> indicate high activation
          — the model found tumor-related features there.
          <span className="text-blue-400 font-medium"> Blue areas</span> show low activation.
        </motion.div>
      )}

      {/* Image viewer */}
      <div className="rounded-xl overflow-hidden bg-black/20">
        {mode === 'side-by-side' && (
          <div className="grid grid-cols-2 gap-0.5">
            <div className="relative">
              <img src={originalImage} alt="Original MRI" className="w-full h-56 object-contain bg-black/30" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-xs text-slate-300">
                Original MRI
              </div>
            </div>
            <div className="relative">
              <img src={gradcamImage} alt="Grad-CAM Heatmap" className="w-full h-56 object-contain bg-black/30" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-xs text-purple-300">
                Grad-CAM Overlay
              </div>
            </div>
          </div>
        )}

        {mode === 'overlay' && (
          <div className="relative h-64 flex items-center justify-center bg-black/30">
            <img src={originalImage} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
            <img
              src={gradcamImage}
              alt="Grad-CAM"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ opacity: opacity / 100 }}
            />
            <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1 px-6">
              <div className="flex items-center gap-2 w-full max-w-xs">
                <EyeOff size={12} className="text-slate-500" />
                <input
                  type="range"
                  min={0} max={100} value={opacity}
                  onChange={e => setOpacity(+e.target.value)}
                  className="flex-1 accent-purple-500"
                  aria-label="Heatmap opacity"
                />
                <Eye size={12} className="text-purple-400" />
                <span className="text-xs text-slate-400 w-8">{opacity}%</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'heatmap-only' && (
          <div className="relative">
            <img src={gradcamImage} alt="Grad-CAM" className="w-full h-64 object-contain bg-black/30" />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-xs text-purple-300">
              Grad-CAM Heatmap
            </div>
          </div>
        )}
      </div>

      {/* Colour scale legend */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-slate-500">Low activation</span>
        <div
          className="h-3 w-40 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #000080, #0000FF, #00FF00, #FFFF00, #FF0000)',
          }}
        />
        <span className="text-xs text-slate-500">High activation</span>
      </div>
    </motion.div>
  )
}
