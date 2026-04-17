import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { BarChart2 } from 'lucide-react'
import type { ModelComparisonStat, MLResults } from '../types'

interface ModelComparisonProps {
  stats: ModelComparisonStat[]
  mlResults: MLResults
}

const MODEL_COLORS: Record<string, string> = {
  CNN:             '#3B82F6',
  SVM:             '#8B5CF6',
  'Random Forest': '#10B981',
}

const METRICS = ['accuracy', 'precision', 'recall', 'f1_score'] as const
const METRIC_LABELS: Record<string, string> = {
  accuracy:  'Accuracy',
  precision: 'Precision',
  recall:    'Recall',
  f1_score:  'F1 Score',
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {METRIC_LABELS[p.dataKey] ?? p.dataKey}: {Number(p.value).toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function ModelComparison({ stats, mlResults }: ModelComparisonProps) {
  // Radar chart data: one entry per metric, value per model
  const radarData = METRICS.map(metric => {
    const entry: Record<string, string | number> = {
      metric: METRIC_LABELS[metric],
    }
    stats.forEach(s => {
      entry[s.model] = s[metric]
    })
    return entry
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-green-400" />
        <h3 className="font-semibold text-white">Model Comparison</h3>
        <span className="text-xs text-slate-500">(Benchmark dataset results)</span>
      </div>

      {/* ── Current scan: ML model results ─────────────────────────────────── */}
      <div>
        <p className="section-heading">This Scan — ML Model Predictions</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(mlResults).map(([modelKey, result]) => {
            const label = modelKey === 'svm' ? 'SVM' : 'Random Forest'
            const color = MODEL_COLORS[label]
            return (
              <div
                key={modelKey}
                className="rounded-xl p-4 bg-white/5 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                  }}>
                    {result.confidence.toFixed(1)}%
                  </span>
                </div>
                <p className="font-bold text-white">{result.predicted_class}</p>
                <div className="h-1.5 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Grouped bar chart ───────────────────────────────────────────────── */}
      <div>
        <p className="section-heading">Benchmark Metrics (%)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="model" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis domain={[60, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={val => (
                <span style={{ color: '#94A3B8', fontSize: 12 }}>{METRIC_LABELS[val] ?? val}</span>
              )}
            />
            {METRICS.map((metric, i) => {
              const shades = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']
              return (
                <Bar key={metric} dataKey={metric} fill={shades[i]} radius={[3, 3, 0, 0]}>
                  {stats.map((entry, j) => (
                    <Cell key={j} fill={shades[i]} opacity={0.85} />
                  ))}
                </Bar>
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Radar chart ─────────────────────────────────────────────────────── */}
      <div>
        <p className="section-heading">Radar — Performance Profile</p>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            {stats.map(s => (
              <Radar
                key={s.model}
                name={s.model}
                dataKey={s.model}
                stroke={MODEL_COLORS[s.model]}
                fill={MODEL_COLORS[s.model]}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
            <Legend
              formatter={val => (
                <span style={{ color: MODEL_COLORS[val] ?? '#94A3B8', fontSize: 12 }}>{val}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Metrics table ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Model</th>
              {METRICS.map(m => (
                <th key={m} className="text-right px-4 py-2.5 text-slate-400 font-medium">
                  {METRIC_LABELS[m]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((row, i) => (
              <tr key={row.model} className={i < stats.length - 1 ? 'border-b border-white/5' : ''}>
                <td className="px-4 py-3 font-medium" style={{ color: MODEL_COLORS[row.model] }}>
                  {row.model}
                </td>
                {METRICS.map(m => (
                  <td key={m} className="text-right px-4 py-3 font-mono text-slate-300">
                    {row[m].toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
