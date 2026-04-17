/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette - Premium vibrant colors
        navy:    { DEFAULT: '#0A1117', 800: '#0D1117', 700: '#1A2332' },
        glass:   { DEFAULT: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' },
        accent: {
          cyan:   '#00D9FF',
          pink:   '#FF6B9D',
          blue:   '#3B82F6',
          purple: '#8B5CF6',
          green:  '#10B981',
          amber:  '#F59E0B',
          red:    '#EF4444',
        },
        'neuro': {
          primary: '#00D9FF',
          secondary: '#FF6B9D',
          light: '#F8FAFB',
          dark: '#0A1117',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #00D9FF 0%, #FF6B9D 50%, #00D9FF 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan':   '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.15)',
        'glow-pink':   '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(255, 107, 157, 0.15)',
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-green':  '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'scan-line':     'scanLine 2s linear infinite',
        'gradient-shift':'gradientShift 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
