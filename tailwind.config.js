/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script.js"],
  theme: {
    extend: {
        colors: {
            tomato: {
                50: '#fef2f2',
                100: '#fee2e2',
                200: '#fecaca',
                300: '#fca5a5',
                400: '#f87171',
                500: '#ef4444',
                600: '#dc2626',
                700: '#b91c1c',
                800: '#991b1b',
                900: '#7f1d1d',
            },
            primary: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                500: '#3b82f6',
                700: '#1d4ed8'
            },
            dark: '#1e293b',
            surface: '#f8fafc'
        },
        animation: {
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }
    }
  },
  plugins: [],
}