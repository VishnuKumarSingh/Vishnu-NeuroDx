import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider }  from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LangProvider }  from './contexts/LangContext'

import Navbar          from './components/Navbar'
import ProtectedRoute  from './components/ProtectedRoute'

import Home      from './pages/Home'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Diagnose  from './pages/Diagnose'
import History   from './pages/History'
import Chat      from './pages/Chat'
import Feedback  from './pages/Feedback'

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <div className="min-h-screen bg-navy-dark dark:bg-navy transition-colors duration-300">
            {/* Ambient background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-cyan/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute top-1/3 -right-32 w-80 h-80 bg-accent-pink/10 dark:bg-teal-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-accent-purple/8 dark:bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10">
              <Routes>
                {/* Public */}
                <Route path="/"      element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/diagnose"  element={<ProtectedRoute><Diagnose /></ProtectedRoute>} />
                <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/feedback"  element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A2332',
                  color: '#E2E8F0',
                  border: '1px solid rgba(0,217,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#00D9FF', secondary: '#1A2332' } },
                error:   { iconTheme: { primary: '#FF3B30', secondary: '#1A2332' } },
              }}
            />
          </div>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
