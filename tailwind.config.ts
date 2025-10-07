import type { Config } from 'tailwindcss';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Dynamic primary color
          hover: 'hsl(var(--primary-hover))',
          light: 'hsl(var(--primary-light))',
        },
        secondary: {
          DEFAULT: '#059669', // Accessible green
          hover: '#047857',
          light: '#d1fae5',
        },
        accent: {
          DEFAULT: '#7c3aed', // Accessible purple
          hover: '#6d28d9',
          light: '#ede9fe',
        },
        error: {
          DEFAULT: '#dc2626', // Accessible red
          hover: '#b91c1c',
          light: '#fee2e2',
        },
        success: {
          DEFAULT: '#16a34a', // Accessible green
          hover: '#15803d',
          light: '#dcfce7',
        },
        warning: {
          DEFAULT: '#d97706', // Accessible orange
          hover: '#b45309',
          light: '#fff7ed',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      spacing: {
        'button': '1rem', // Larger button padding
        'input': '0.75rem', // Larger input padding
      },
      fontSize: {
        'button': '1.125rem', // Larger button text
        'input': '1.125rem', // Larger input text
      },
      borderRadius: {
        'button': '0.75rem', // Rounded corners for better visual hierarchy
        'input': '0.75rem',
        'card': '1rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['IranSans', 'Tahoma', 'Arial', 'sans-serif'],
        'iran-sans': ['IranSans', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'loading-bar': 'loading-bar 1s ease-in-out infinite',
        'gradient-slow': 'gradient 15s ease infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
