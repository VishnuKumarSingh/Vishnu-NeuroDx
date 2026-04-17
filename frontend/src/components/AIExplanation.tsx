import { motion } from 'framer-motion'
import { Sparkles, AlertCircle } from 'lucide-react'

interface AIExplanationProps {
  explanation: string
  isLoading?: boolean
}

// Very minimal markdown → JSX renderer (bold, italic, hr, paragraphs)
function renderMarkdown(text: string) {
  return text.split('\n\n').map((block, i) => {
    if (block.startsWith('---')) {
      return <hr key={i} className="border-white/10 my-4" />
    }

    // Inline bold + italic
    const parts = block.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-blue-300 font-semibold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={j} className="text-slate-400 italic">{part.slice(1, -1)}</em>
      }
      return <span key={j}>{part}</span>
    })

    return (
      <p key={i} className="text-slate-300 leading-relaxed text-sm mb-3">
        {rendered}
      </p>
    )
  })
}

export default function AIExplanation({ explanation, isLoading }: AIExplanationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <h3 className="font-semibold text-white">AI Clinical Impression</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
          Generative AI
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[90, 75, 60, 80].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-white/5 animate-pulse"
              style={{ width: `${w}%` }}
            />
          ))}
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-4">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Generating clinical impression…
          </p>
        </div>
      ) : (
        <div className="prose-dark">{renderMarkdown(explanation)}</div>
      )}

      {/* Disclaimer badge */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          This explanation is AI-generated for informational purposes only and does not constitute
          a medical diagnosis. Always consult a qualified healthcare professional.
        </span>
      </div>
    </motion.div>
  )
}
