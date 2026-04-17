import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Eye, EyeOff, CheckCircle2, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import clsx from 'clsx'

type Tab = 'login' | 'signup'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const { lang, setLang, t } = useLang()

  const [tab, setTab] = useState<Tab>('login')
  const [showPwd, setShowPwd] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPwd, setLoginPwd]           = useState('')
  const [loginErr, setLoginErr]           = useState('')

  // Signup fields
  const [signupName, setSignupName]       = useState('')
  const [signupEmail, setSignupEmail]     = useState('')
  const [signupPwd, setSignupPwd]         = useState('')
  const [signupErr, setSignupErr]         = useState('')

  function handleLogin() {
    setLoginErr('')
    const err = login(loginEmail, loginPwd)
    if (err) { setLoginErr(err); return }
    toast.success('Welcome back!')
    navigate('/dashboard')
  }

  function handleSignup() {
    setSignupErr('')
    const err = signup(signupName, signupEmail, signupPwd)
    if (err) { setSignupErr(err); return }
    toast.success('Account created! Please login.')
    setTab('login')
    setLoginEmail(signupEmail)
  }

  const FEATURES = [
    { icon: CheckCircle2, text: t('clinical_grade_ai') },
    { icon: Lock,         text: t('hipaa_compliant') },
    { icon: Globe,        text: t('english_hindi_support') },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#0A1628 0%,#0d2620 50%,#0A1628 100%)' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl relative z-10"
        style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
      >
        {/* ── Left hero panel ─────────────────────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between p-12"
          style={{ background: 'linear-gradient(135deg, #0d1f3c 0%, #006b5f 100%)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 flex items-center justify-center">
                <Brain size={22} className="text-teal-300" />
              </div>
              <span className="font-bold text-xl text-white font-mono">NeuroAI Detect</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-snug mb-4">
              {lang === 'hi'
                ? 'AI-संचालित ब्रेन ट्यूमर पहचान'
                : 'AI-Powered Brain Tumor Detection'}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              {lang === 'hi'
                ? 'अत्याधुनिक न्यूरोलॉजिकल MRI विश्लेषण। सुरक्षित, सटीक।'
                : 'State-of-the-art neurological MRI analysis. Secure, accurate, and fast.'}
            </p>
          </div>
          <div className="space-y-4 mt-10">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <Icon size={16} className="text-teal-300 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ────────────────────────────────────────────── */}
        <div className="bg-navy-800 p-10 flex flex-col justify-center"
          style={{ background: '#0f1923' }}>

          {/* Lang toggle */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 md:hidden">
              <Brain size={18} className="text-teal-400" />
              <span className="font-bold text-white">NeuroAI</span>
            </div>
            <div className="flex gap-1 rounded-full bg-white/5 p-1 ml-auto">
              {(['en', 'hi'] as const).map(l => (
                <button key={l}
                  onClick={() => setLang(l)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-bold transition-all',
                    lang === l
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white',
                  )}
                >
                  {l === 'en' ? 'EN' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-8">
            {(['login', 'signup'] as Tab[]).map(tabType => (
              <button key={tabType} onClick={() => setTab(tabType)}
                className={clsx(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                  tab === tabType
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {tabType === 'login'
                  ? t('login')
                  : t('signup')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div key="login"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-1">
                    {t('welcome')}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {t('sign_in_description')}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {t('email_address')}
                    </label>
                    <input type="email" className="input-dark"
                      placeholder="doctor@hospital.com"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} className="input-dark pr-10"
                        placeholder="••••••••"
                        value={loginPwd} onChange={e => setLoginPwd(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      />
                      <button onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {loginErr && <p className="text-red-400 text-xs">{loginErr}</p>}
                  <button className="btn-primary w-full" onClick={handleLogin}>
                    {t('login_to_dashboard')}
                  </button>
                </div>
                <p className="text-center text-sm text-slate-500">
                  {t('no_account')}{' '}
                  <button onClick={() => setTab('signup')} className="text-teal-400 font-semibold hover:text-teal-300">
                    {t('sign_up')}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="signup"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-1">
                    {t('create_account')}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {t('join_platform')}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {t('full_name')}
                    </label>
                    <input type="text" className="input-dark"
                      placeholder="Dr. Firstname Lastname"
                      value={signupName} onChange={e => setSignupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {t('email_address')}
                    </label>
                    <input type="email" className="input-dark"
                      placeholder="doctor@hospital.com"
                      value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {t('password_min')}
                    </label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} className="input-dark pr-10"
                        placeholder="••••••••"
                        value={signupPwd} onChange={e => setSignupPwd(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignup()}
                      />
                      <button onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {signupErr && <p className="text-red-400 text-xs">{signupErr}</p>}
                  <button className="btn-primary w-full" onClick={handleSignup}>
                    {t('create_account_btn')}
                  </button>
                </div>
                <p className="text-center text-sm text-slate-500">
                  {t('have_account')}{' '}
                  <button onClick={() => setTab('login')} className="text-teal-400 font-semibold hover:text-teal-300">
                    {t('login')}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
