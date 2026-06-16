/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '16px',
      screens: {
        'sm': '640px',
        'md': '768px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#E8F3FF',
          100: '#BEDAFF',
          200: '#94BFFF',
          300: '#6AA4FF',
          400: '#4089FF',
          500: '#165DFF',
          600: '#0E42D2',
          700: '#0A2BA0',
          800: '#06196E',
          900: '#030D3C',
        },
        success: {
          50: '#E8FFEA',
          100: '#B7FBBE',
          200: '#85F791',
          300: '#53F365',
          400: '#23F03A',
          500: '#00B42A',
          600: '#008C1F',
          700: '#006515',
          800: '#003E0D',
          900: '#001704',
        },
        warning: {
          50: '#FFF3E8',
          100: '#FFDAB7',
          200: '#FFC085',
          300: '#FFA653',
          400: '#FF8C23',
          500: '#FF7D00',
          600: '#D26500',
          700: '#A04D00',
          800: '#6E3500',
          900: '#3C1D00',
        },
        danger: {
          50: '#FFECEC',
          100: '#FFC8C8',
          200: '#FFA3A3',
          300: '#FF7D7D',
          400: '#FF5858',
          500: '#F53F3F',
          600: '#CB2630',
          700: '#A11523',
          800: '#770A18',
          900: '#4D050E',
        },
        neutral: {
          50: '#F7F8FA',
          100: '#F2F3F5',
          200: '#E5E6EB',
          300: '#C9CDD4',
          400: '#86909C',
          500: '#4E5969',
          600: '#272E3B',
          700: '#1D2129',
          800: '#000000',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'scan-line': 'scanLine 2s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(22, 93, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
