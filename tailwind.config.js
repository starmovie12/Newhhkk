/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': 'backdrop-blur-md',
      },
      colors: {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'pending': '#3b82f6',
      },
    },
  },
  plugins: [],
}
