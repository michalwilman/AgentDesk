import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB6D9',
          50: '#FFF5F9',
          100: '#FFE8F1',
          200: '#FFD6E7',
          300: '#FFC4DD',
          400: '#FFB6D9',
          500: '#FF9FCB',
          600: '#FF69B4',
          700: '#E6539E',
          800: '#CC3D88',
          900: '#B32772',
        },
        secondary: {
          DEFAULT: '#FF69B4',
          light: '#FF8DC7',
          dark: '#E6539E',
        },
        dark: {
          DEFAULT: '#2D2D2D',
          50: '#F9FAFB',
          100: '#FAFAFA',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

