/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // 반응형 브레이크포인트 명시적 정의 (모바일 우선)
    screens: {
      sm: '640px',   // 모바일 (가로 모드) 및 소형 태블릿
      md: '768px',   // 태블릿
      lg: '1024px',  // 데스크톱
      xl: '1280px',  // 대형 데스크톱
      '2xl': '1536px', // 초대형 화면
    },
    extend: {
      colors: {
        primary: '#FF6B4A', // Orange/Coral
        'primary-50': '#fff5f2',
        'primary-100': '#ffe8e0',
        'primary-200': '#ffd0c2',
        'primary-300': '#ffb199',
        'primary-400': '#ff8a65',
        'primary-500': '#FF6B4A',
        'primary-600': '#f04e2b',
        'primary-700': '#d43d1e',
        'primary-800': '#b02f18',
        'primary-900': '#8f2715',
        secondary: '#FF8A65',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'sidebar-bg': '#1A1A1A',
        'sidebar-hover': '#2D2D2D',
        'sidebar-active': '#3A3A3A',
        'header-bg': '#ffffff',
        'bg-main': '#F5F6FA',
        'card-bg': '#ffffff',
        'border-color': '#E8E9F1',
        'panel-bg': '#fafafa',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'dark-bg': '#111827',
        'dark-card': '#1f2937',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      // 반응형 간격 시스템
      spacing: {
        'touch-min': '44px', // 터치 최소 크기
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // 반응형 크기 시스템
      minWidth: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      // 반응형 폰트 크기 시스템
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.75rem' }],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-out': 'fadeOut 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}