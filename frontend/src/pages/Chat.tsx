import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Trash2, Paperclip, X } from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import { sendChatMessage } from '../services/api'
import type { ChatMsg } from '../types'
import clsx from 'clsx'

const CHAT_KEY = 'neuroai_chat_msgs'

function getStoredMsgs(): ChatMsg[] {
  return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
}
function storeMsgs(msgs: ChatMsg[]) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(msgs))
}

// Minimal markdown renderer: bold, line breaks
function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**'))
        return <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>
      return <span key={j}>{p}</span>
    })
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>
  })
}

export default function Chat() {
  const { lang, t } = useLang()
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    const stored = getStoredMsgs()
    if (stored.length) return stored
    return [{ role: 'assistant', content: t('ai_greeting'), ts: new Date().toISOString() }]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text && !attachedFile) return

    const userMsg: ChatMsg = {
      role: 'user',
      content: text,
      ts: new Date().toISOString(),
      file: attachedFile?.name,
    }
    const next = [...msgs, userMsg]
    setMsgs(next)
    storeMsgs(next)
    setInput('')
    setAttachedFile(null)
    setLoading(true)

    try {
      const apiMsgs = next.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const reply = await sendChatMessage(apiMsgs, lang)
      const aiMsg: ChatMsg = { role: 'assistant', content: reply, ts: new Date().toISOString() }
      const final = [...next, aiMsg]
      setMsgs(final)
      storeMsgs(final)
    } catch {
      const fallbacks: Record<string, string> = {
        en: "I'm having trouble connecting right now. Please try again in a moment.",
        hi: "अभी कनेक्शन में समस्या है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
      }
      const aiMsg: ChatMsg = { role: 'assistant', content: fallbacks[lang] ?? fallbacks.en, ts: new Date().toISOString() }
      const final = [...next, aiMsg]
      setMsgs(final)
      storeMsgs(final)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, msgs, attachedFile, lang])

  function clearChat() {
    if (!confirm(t('clear_chat_confirm'))) return
    const fresh: ChatMsg[] = [{ role: 'assistant', content: t('ai_greeting'), ts: new Date().toISOString() }]
    setMsgs(fresh)
    storeMsgs(fresh)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const SUGGESTIONS = lang === 'hi'
    ? ['ट्यूमर के लक्षण क्या हैं?', 'MRI स्कैन कैसे काम करती है?', 'ग्लियोमा क्या है?']
    : ['What are symptoms of a brain tumor?', 'How does Grad-CAM work?', 'What is a glioma?']  // Keep suggestions in both languages

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass-card rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">NeuroAI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs text-teal-400 font-medium">
                {t('online')}
              </span>
            </div>
          </div>
        </div>
        <button onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors">
          <Trash2 size={13} />
          {t('clear_chat')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Suggestions (only when 1 message) */}
        {msgs.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500/40 hover:text-white transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {msgs.map((msg, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 mb-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={clsx(
              'max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-gradient-to-br from-teal-600 to-blue-600 text-white rounded-br-sm'
                : 'bg-white/8 text-slate-200 border border-white/10 rounded-bl-sm',
            )}>
              {msg.file && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-white/10 text-xs">
                  <Paperclip size={12} />
                  {msg.file}
                </div>
              )}
              <div>{renderContent(msg.content)}</div>
              <p className="text-[10px] opacity-50 mt-1.5">
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/8 border border-white/10 flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.span key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                    className="w-2 h-2 rounded-full bg-teal-400 inline-block"
                  />
                ))}
                <span className="text-xs text-slate-400 ml-2">
                  {t('typing')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 px-4 py-4 space-y-2" style={{ background: 'rgba(10,22,40,0.9)' }}>
        {/* File attachment preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Paperclip size={12} className="text-blue-400" />
              <span className="text-slate-300 flex-1 truncate">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-red-400">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* File attach button */}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all flex-shrink-0">
            <Paperclip size={16} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.dcm,.txt" className="hidden"
            onChange={e => setAttachedFile(e.target.files?.[0] || null)} />

          {/* Text input */}
          <div className="flex-1">
            <textarea ref={inputRef}
              rows={1}
              className="input-dark resize-none min-h-[42px] max-h-[120px]"
              placeholder={t('chat_placeholder')}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e.target) }}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
          </div>

          {/* Send button */}
          <button onClick={handleSend} disabled={loading || (!input.trim() && !attachedFile)}
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
              input.trim() || attachedFile
                ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white hover:scale-105'
                : 'bg-white/5 text-slate-600 cursor-not-allowed',
            )}>
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600">
          {lang === 'hi'
            ? 'AI प्रतिक्रियाएं केवल सूचनात्मक हैं। हमेशा योग्य चिकित्सक से परामर्श लें।'
            : 'AI responses are for informational purposes only. Always consult a qualified physician.'}
        </p>
      </div>
    </div>
  )
}
