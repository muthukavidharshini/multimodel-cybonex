/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#02040f',
          900: '#040812',
          850: '#060b18',
          800: '#080e1e',
          700: '#0d1530',
          600: '#111d42',
          500: '#162454',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glowPulse 2.5s ease-in-out infinite',
        'scan': 'scanLine 1.8s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 8px rgba(59,130,246,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(59,130,246,0.5)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(500%)' },
        }
      }
    }
  },
  plugins: []
}
