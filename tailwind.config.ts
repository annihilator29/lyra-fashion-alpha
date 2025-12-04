import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Organic Modern Color Palette
        primary: {
          50: '#f3f6f4',
          100: '#e1e9e3',
          200: '#c4d5c8',
          300: '#9db8a4',
          400: '#7a9b7c',
          500: '#5f8161', // Main primary - earthy green
          600: '#4a5f4b',
          700: '#3c4d3d',
          800: '#323f33',
          900: '#2b362c',
        },
        secondary: {
          50: '#fcf4f2',
          100: '#f9e7e3',
          200: '#f3cfc7',
          300: '#e8a896',
          400: '#dc8c73',
          500: '#c87e6c', // Main secondary - warm terracotta
          600: '#b36854',
          700: '#8e5243',
          800: '#754439',
          900: '#442f27',
        },
        neutral: {
          50: '#f5f3f0', // Lightest warm gray
          100: '#ebe8e3',
          200: '#ddd8d1',
          300: '#c5beb5',
          400: '#a8a097',
          500: '#8b8279',
          600: '#6e665e',
          700: '#564f48',
          800: '#44403a',
          900: '#3a3531', // Darkest warm gray
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(58, 53, 49, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(58, 53, 49, 0.1), 0 1px 2px 0 rgba(58, 53, 49, 0.06)',
        md: '0 4px 6px -1px rgba(58, 53, 49, 0.1), 0 2px 4px -1px rgba(58, 53, 49, 0.06)',
        lg: '0 10px 15px -3px rgba(58, 53, 49, 0.1), 0 4px 6px -2px rgba(58, 53, 49, 0.05)',
        xl: '0 20px 25px -5px rgba(58, 53, 49, 0.1), 0 10px 10px -5px rgba(58, 53, 49, 0.04)',
        '2xl': '0 25px 50px -12px rgba(58, 53, 49, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
