import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLang } from '../contexts/LangContext'
import { useAuth } from '../contexts/AuthContext'
import type { FeedbackRecord } from '../types'
import clsx from 'clsx'

const FEEDBACK_KEY = 'neuroai_feedbacks'

function getFeedbacks(): FeedbackRecord[] {
  return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]')
}

const STAR_LABELS: Record<string, string[]> = {
  en: ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
  hi: ['', 'बहुत खराब', 'खराब', 'औसत', 'अच्छा', 'बेहतरीन'],
}

export default function Feedback() {
  const { lang, t } = useLang()
  const { user } = useAuth()
  const [rating, setRating]         = useState(0)
  const [hovered, setHovered]       = useState(0)
  const [category, setCategory]     = useState('')
  const [text, setText]             = useState('')
  const [feedbacks, setFeedbacks]   = useState<FeedbackRecord[]>(getFeedbacks)

  const CATEGORIES = [
    { key: 'ui',          en: 'UI / Design',       hi: 'UI / डिज़ाइन' },
    { key: 'accuracy',    en: 'AI Accuracy',        hi: 'AI सटीकता' },
    { key: 'performance', en: 'Performance',        hi: 'प्रदर्शन' },
    { key: 'feature',     en: 'Feature Request',    hi: 'फीचर अनुरोध' },
    { key: 'bug',         en: 'Bug Report',         hi: 'बग रिपोर्ट' },
  ]

  function submit() {
    if (!text.trim() || !rating) {
      toast.error(t('fill_required_fields'))
      return
    }
    const record: FeedbackRecord = {
      text: text.trim(),
      rating,
      category,
      date: new Date().toISOString(),
      user: user?.name || 'Anonymous',
    }
    const next = [...feedbacks, record]
    setFeedbacks(next)
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next))
    toast.success(t('feedback_thanks'))
    setRating(0); setCategory(''); setText('')
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <p className="section-heading">{t('feedback_page_heading')}</p>
        <h1 className="text-2xl font-extrabold text-white">
          {t('send_feedback_title')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t('help_improve_neuroai')}
        </p>
      </div>

      {/* Star rating */}
      <div className="glass-card p-5 space-y-4">
        <p className="font-semibold text-white text-sm">
          {t('rate_experience')}
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star size={28}
                className={clsx('transition-colors', n <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600')}
              />
            </button>
          ))}
        </div>
        {(hovered || rating) > 0 && (
          <p className="text-sm text-amber-400 font-medium">
            {STAR_LABELS[lang]?.[hovered || rating] ?? STAR_LABELS.en[hovered || rating]}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="glass-card p-5 space-y-3">
        <p className="font-semibold text-white text-sm">
          {t('feedback_category')}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.key}
              onClick={() => setCategory(category === c.key ? '' : c.key)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                category === c.key
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'border-white/15 text-slate-400 hover:border-white/30 hover:text-white',
              )}
            >
              {lang === 'hi' ? c.hi : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="glass-card p-5 space-y-3">
        <p className="font-semibold text-white text-sm">
          {t('feedback_message')}
        </p>
        <textarea className="input-dark resize-none" rows={5}
          placeholder={t('message_placeholder')}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      <button onClick={submit} className="btn-primary flex items-center gap-2">
        <Send size={16} />
        {t('submit_feedback')}
      </button>

      {/* Past feedback */}
      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <p className="section-heading mt-8">
            {t('submitted_feedback')}
          </p>
          {feedbacks.slice().reverse().map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={14}
                      className={n <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{new Date(f.date).toLocaleDateString()}</span>
              </div>
              {f.category && (
                <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {f.category}
                </span>
              )}
              <p className="text-sm text-slate-300">{f.text}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
