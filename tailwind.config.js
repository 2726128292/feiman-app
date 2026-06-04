/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      screens: {
        sm: '640px',
        md: '430px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F6EF7',
          light: '#6B8AF7',
          dark: '#3B52D4',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        knowledge: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(79,110,247,0.12)',
      },
    },
  },
  plugins: [],
};
