import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Activity, CheckCircle2, MessageSquare,
  Plus, FileText, ChevronRight, Scan,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import { useScans } from '../hooks/useScans'
import clsx from 'clsx'

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    let cur = 0
    const step = Math.max(1, Math.ceil(value / 20))
    const id = setInterval(() => {
      cur = Math.min(cur + step, value)
      if (ref.current) ref.current.textContent = String(cur)
      if (cur >= value) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [value])
  return <span ref={ref}>0</span>
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { t, lang } = useLang()
  const { scans } = useScans()

  const detected = scans.filter(s => s.result === 'detected').length
  const clear    = scans.filter(s => s.result === 'clear').length
  const total    = scans.length
  const chatMsgs = JSON.parse(localStorage.getItem('neuroai_chat_msgs') || '[]')
  const chatCount = chatMsgs.filter((m: any) => m.role === 'user').length

  const recent = scans.slice().reverse().slice(0, 5)

  const STATS = [
    {
      label: t('total_scans'),
      value: total,
      icon: Scan,
      gradient: 'from-blue-600 to-teal-500',
      text: 'text-white',
    },
    {
      label: t('tumors_detected'),
      value: detected,
      icon: Activity,
      color: 'text-red-400',
      bar: detected / (total || 1),
      barColor: 'from-red-500 to-rose-400',
    },
    {
      label: t('clear_scans'),
      value: clear,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bar: clear / (total || 1),
      barColor: 'from-teal-500 to-emerald-400',
    },
    {
      label: t('ai_chats'),
      value: chatCount,
      icon: MessageSquare,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-heading">{t('overview')}</p>
        <h1 className="text-2xl font-extrabold text-white">
          {t('welcome')}, {user?.name || 'Doctor'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t('ai_fingertips')}
        </p>
      </motion.div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={clsx(
                'glass-card p-5 space-y-3',
                s.gradient && `bg-gradient-to-br ${s.gradient} border-0`,
              )}
            >
              <div className="flex items-center justify-between">
                <p className={clsx('text-xs font-bold uppercase tracking-wider', s.text ?? 'text-slate-400')}>
                  {s.label}
                </p>
                <Icon size={16} className={s.text ?? s.color ?? 'text-slate-400'} />
              </div>
              <p className={clsx('font-black text-4xl leading-none', s.text ?? s.color ?? 'text-white')}>
                <AnimatedNumber value={s.value} />
              </p>
              {s.bar !== undefined && (
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.bar * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${s.barColor}`}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <p className="section-heading">{t('quick_actions')}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/diagnose')} className="btn-primary flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
            <Plus size={16} />
            {t('new_scan')}
          </button>
          <button onClick={() => navigate('/chat')} className="btn-secondary flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
            <MessageSquare size={16} />
            {t('ask_ai')}
          </button>
          <button onClick={() => navigate('/history')} className="btn-secondary flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
            <FileText size={16} />
            {t('view_reports')}
          </button>
        </div>
      </div>

      {/* Recent scans */}
      <div className="glass-card overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
          <p className="font-semibold text-white flex items-center gap-2">
            <Brain size={16} className="text-accent-cyan" />
            {t('recent_scans')}
          </p>
          <button onClick={() => navigate('/history')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
            {t('view_all')}
            <ChevronRight size={14} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Scan size={40} className="mx-auto opacity-30" />
            <p className="text-sm">{t('no_scans')}</p>
            <button onClick={() => navigate('/diagnose')} className="text-xs text-blue-400 hover:underline">
              {t('first_scan')}
            </button>
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="grid grid-cols-4 px-6 py-2.5 bg-white/3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{t('case')}</span>
              <span>{t('date')}</span>
              <span>{t('result')}</span>
              <span className="text-right">{t('confidence')}</span>
            </div>
            {recent.map((scan, i) => (
              <div key={scan.caseId}
                className={clsx(
                  'grid grid-cols-4 px-6 py-3.5 items-center',
                  i < recent.length - 1 && 'border-b border-white/5',
                  'hover:bg-white/3 transition-colors cursor-pointer',
                )}
                onClick={() => navigate('/history')}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    scan.result === 'detected' ? 'bg-red-500/15' : 'bg-teal-500/15',
                  )}>
                    <Brain size={14} className={scan.result === 'detected' ? 'text-red-400' : 'text-teal-400'} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{scan.filename}</p>
                    <p className="text-xs text-slate-500">{scan.caseId}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(scan.date).toLocaleDateString()}
                </span>
                <span className={clsx(
                  'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit',
                  scan.result === 'detected'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
                )}>
                  {scan.result === 'detected' ? t('tumor_found') : t('no_tumor')}
                </span>
                <span className="text-right text-sm font-mono text-slate-300">
                  {scan.confidence.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
