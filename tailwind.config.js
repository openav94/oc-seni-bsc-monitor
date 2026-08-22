/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#0f2138',
          800: '#16304f',
          700: '#1e3f66',
          600: '#28517f',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          400: '#4f9ae8',
          500: '#2f7fd1',
          600: '#1f66b0',
          700: '#19518c',
        },
        status: {
          good: '#1f9d55',
          watch: '#c98a02',
          bad: '#d0342c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 33, 56, 0.06), 0 1px 3px rgba(15, 33, 56, 0.08)',
        panel: '0 4px 16px rgba(15, 33, 56, 0.08)',
      },
    },
  },
  plugins: [],
}
