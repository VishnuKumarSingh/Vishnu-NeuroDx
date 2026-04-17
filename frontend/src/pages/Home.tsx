import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Brain, Zap, Shield, FileText, BarChart2, Sparkles,
  ArrowRight, CheckCircle2,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    color: 'blue',
    title: 'Deep Learning CNN',
    desc: '4-class tumor classification with 97%+ benchmark accuracy using a custom TensorFlow/Keras architecture.',
  },
  {
    icon: Zap,
    color: 'purple',
    title: 'Grad-CAM Visualization',
    desc: 'Gradient-weighted heatmaps pinpoint the exact tumor region, making AI decisions interpretable.',
  },
  {
    icon: Sparkles,
    color: 'cyan',
    title: 'AI Clinical Explanation',
    desc: 'Claude AI translates model outputs into clear, professional clinical impressions in seconds.',
  },
  {
    icon: BarChart2,
    color: 'green',
    title: 'Multi-Model Comparison',
    desc: 'Benchmark CNN against SVM and Random Forest across accuracy, precision, recall, and F1 metrics.',
  },
  {
    icon: FileText,
    color: 'amber',
    title: 'PDF Report Generation',
    desc: 'Download a complete diagnostic report including patient info, MRI scans, heatmaps, and AI explanation.',
  },
  {
    icon: Shield,
    color: 'red',
    title: 'Production Ready',
    desc: 'FastAPI backend, React frontend, Dockerised deployment. Ready for Render, Railway, and Vercel.',
  },
]

const TUMOR_CLASSES = [
  { name: 'Glioma',          desc: 'Most common primary brain tumor. Arises from glial cells.',          color: '#EF4444' },
  { name: 'Meningioma',      desc: 'Typically benign, arises from the meninges. Most common overall.',   color: '#F59E0B' },
  { name: 'Pituitary Tumor', desc: 'Affects the pituitary gland. May disrupt hormonal balance.',         color: '#F97316' },
  { name: 'No Tumor',        desc: 'No significant tumor-like abnormalities detected in the scan.',      color: '#10B981' },
]

const COLOR_MAP: Record<string, string> = {
  blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  green:  'text-green-400 bg-green-500/10 border-green-500/20',
  amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  red:    'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function Home() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium">
            <Sparkles size={14} />
            AI-Powered Brain Tumor Detection
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">Advanced </span>
            <span className="gradient-text">Neuro</span>
            <span className="text-white">AI</span>
            <br />
            <span className="text-slate-300 text-4xl md:text-5xl font-bold">
              Brain Tumor Diagnosis
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload an MRI scan and get instant AI-powered tumor classification,
            Grad-CAM heatmaps, clinical-grade explanations, and a downloadable PDF report —
            all in under 10 seconds.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isLoggedIn ? '/diagnose' : '/login')}
              className="btn-primary flex items-center gap-2 text-base px-8 py-4"
            >
              <Brain size={20} />
              {isLoggedIn ? 'Start Diagnosis' : 'Get Started'}
              <ArrowRight size={18} />
            </motion.button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
            >
              Learn More
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-slate-500">
            {['97.5% CNN Accuracy', '4-Class Classification', 'Grad-CAM Heatmaps', 'PDF Reports'].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" />
                {s}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 w-full max-w-3xl mx-auto glass-card p-6 rounded-3xl"
        >
          <div className="grid grid-cols-3 gap-4">
            {TUMOR_CLASSES.map(tc => (
              <div
                key={tc.name}
                className="rounded-xl p-4 bg-white/5 border border-white/10 text-left space-y-1"
              >
                <div className="w-3 h-3 rounded-full" style={{ background: tc.color }} />
                <p className="text-xs font-semibold text-white">{tc.name}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tc.desc}</p>
              </div>
            ))}
            <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex flex-col items-center justify-center gap-2">
              <Brain size={28} className="text-blue-400" />
              <p className="text-xs font-semibold text-center text-blue-300">
                CNN · SVM · Random Forest
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-heading">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need for{' '}
            <span className="gradient-text">AI-assisted diagnosis</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            const cls = COLOR_MAP[f.color]
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card-hover p-6 space-y-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${cls}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-10 text-center space-y-6 border border-blue-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)',
            }}
          >
            <h2 className="text-3xl font-bold text-white">
              Ready to analyze an MRI scan?
            </h2>
            <p className="text-slate-400">
              Upload your scan and receive a complete AI diagnostic report in seconds.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isLoggedIn ? '/diagnose' : '/login')}
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
            >
              <Brain size={20} />
              Launch Diagnosis Tool
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  )
}
