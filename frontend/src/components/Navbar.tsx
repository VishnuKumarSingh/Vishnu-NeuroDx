import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, LayoutDashboard, Scan, History, MessageSquare,
  Star, Sun, Moon, LogOut, ChevronDown, Activity, Menu, X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth }  from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLang }  from '../contexts/LangContext'
import toast        from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav_dashboard' },
  { to: '/diagnose',  icon: Scan,            labelKey: 'nav_detection' },
  { to: '/history',   icon: History,         labelKey: 'nav_history'   },
  { to: '/chat',      icon: MessageSquare,   labelKey: 'nav_chat'      },
  { to: '/feedback',  icon: Star,            labelKey: 'nav_feedback'  },
]

export default function Navbar() {
  const { pathname }       = useLocation()
  const navigate           = useNavigate()
  const { user, logout, isLoggedIn } = useAuth()
  const { theme, toggle }  = useTheme()
  const { lang, setLang, t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  function handleLogout() {
    if (!confirm(t('logout_confirm'))) return
    logout()
    toast.success(t('logout_success'))
    navigate('/login')
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{ position: 'relative' }}
    >
      <style>{`
        :root {
          --header-bg: #000000;
        }
        html.light {
          --header-bg: linear-gradient(90deg, rgba(248,250,251,0.95) 0%, rgba(240,243,247,0.92) 100%);
        }
        header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00D9FF 0%, #FF6B9D 50%, #00D9FF 100%);
          z-index: 40;
        }
        html.light header::after {
          display: none;
        }
      `}</style>
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
        style={{ 
          background: 'var(--header-bg)'
        }}
      >
        {/* Logo */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center">
            <Brain size={17} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            <span className="text-accent-cyan">MV</span>
            <span className="dark:text-white text-gray-900"> NeuroDx</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, icon: Icon, labelKey }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95',
                    active
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-lg dark:bg-accent-cyan/20 dark:text-accent-cyan dark:border-accent-cyan/30' 
                      : 'text-slate-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 hover:border-accent-cyan/20 dark:hover:border-accent-cyan/20',
                  )}
                >
                  <Icon size={15} />
                  {t(labelKey as any)}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* System status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-cyan/10 dark:bg-accent-cyan/10 border border-accent-cyan/20 dark:border-accent-cyan/20 text-accent-cyan text-xs font-medium">
            <Activity size={11} className="animate-pulse" />
            Online
          </div>

          {/* Lang toggle */}
          <div className="flex gap-0.5 rounded-full bg-white/5 dark:bg-white/5 p-0.5 transition-all hover:bg-white/10 dark:hover:bg-white/10">
            {(['en', 'hi'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-110 active:scale-95',
                  lang === l 
                    ? 'bg-accent-cyan/30 text-accent-cyan shadow-lg dark:bg-accent-cyan/30 dark:text-accent-cyan' 
                    : 'text-slate-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/5',
                )}>
                {l === 'en' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-8 h-8 rounded-lg bg-white/5 dark:bg-white/5 border border-accent-cyan/20 dark:border-accent-cyan/20 flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-accent-cyan dark:hover:text-accent-cyan transition-all hover:bg-accent-cyan/10 dark:hover:bg-accent-cyan/10 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User menu (logged in) */}
          {isLoggedIn && user && (
            <div className="relative">
              <button onClick={() => setUserOpen(v => !v)}
                className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 dark:bg-white/5 border border-accent-cyan/20 dark:border-accent-cyan/20 hover:border-accent-cyan/40 dark:hover:border-accent-cyan/40 transition-all hover:scale-105 active:scale-95 hover:bg-white/10 dark:hover:bg-white/10"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 dark:text-slate-300 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={13} className="text-slate-500 dark:text-slate-500" />
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-52 glass-card p-2 space-y-0.5"
                    style={{ zIndex: 100 }}
                  >
                    <div className="px-3 py-2 border-b border-accent-cyan/20 mb-1">
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { setUserOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                      <LogOut size={14} />
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile hamburger */}
          {isLoggedIn && (
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-8 h-8 rounded-lg bg-white/5 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-400 hover:scale-110 active:scale-95 transition-transform hover:bg-white/10 dark:hover:bg-white/10">
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-accent-cyan/15 dark:border-accent-cyan/15 px-4 py-3 space-y-1"
            style={{ 
              background: 'var(--header-bg)',
              borderTopColor: 'var(--header-border)'
            }}
          >
            {NAV_LINKS.map(({ to, icon: Icon, labelKey }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95',
                  pathname === to
                    ? 'bg-accent-cyan/20 text-accent-cyan shadow-lg dark:bg-accent-cyan/20 dark:text-accent-cyan' 
                    : 'text-slate-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 hover:border-accent-cyan/20 dark:hover:border-accent-cyan/20',
                )}>
                <Icon size={16} />
                {t(labelKey as any)}
              </Link>
            ))}
            <div className="pt-2 border-t border-accent-cyan/15 dark:border-accent-cyan/15">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{user.email}</p>
                  </div>
                </div>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors hover:scale-105 active:scale-95">
                <LogOut size={14} />
                {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
