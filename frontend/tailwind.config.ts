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
          DEFAULT: '#00E0C6',
          50: '#E6FFFC',
          100: '#CCFFF9',
          200: '#99FFF3',
          300: '#66FFED',
          400: '#33FFE7',
          500: '#00E0C6',
          600: '#00B39E',
          700: '#008677',
          800: '#00594F',
          900: '#002C28',
        },
        secondary: {
          DEFAULT: '#00E0C6',
          light: '#33FFE7',
          dark: '#00B39E',
        },
        dark: {
          DEFAULT: '#0D0D0D',
          50: '#1A1A1A',
          100: '#262626',
          200: '#333333',
          300: '#404040',
          400: '#4D4D4D',
          500: '#666666',
          600: '#808080',
          700: '#999999',
          800: '#B0B0B0',
          900: '#CCCCCC',
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

