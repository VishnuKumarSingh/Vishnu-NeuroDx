import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1F3C',
            color: '#E2E8F0',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#0D1F3C' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#0D1F3C' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
