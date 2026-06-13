import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0A1F5C',
        accent:  '#3b5fe0',
        'blue-mid': '#1D4ED8',
        'text-base': '#0A0F1E',
        'text-2':    '#374151',
        'text-muted':'#6B7280',
        'bg-subtle': '#F7F8FA',
        'border-base': '#E5E7EB',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        tight:    '-0.02em',
        tighter:  '-0.03em',
        tightest: '-0.04em',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0A1F5C 0%, #3b5fe0 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,95,224,0.12) 0%, transparent 70%)',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(10,31,92,0.06), 0 8px 24px rgba(10,31,92,0.06)',
        'card-hover': '0 4px 24px rgba(10,31,92,0.10)',
        'btn':    '0 1px 2px rgba(10,31,92,0.12), 0 4px 16px rgba(59,95,224,0.18)',
        'btn-hover': '0 4px 24px rgba(59,95,224,0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
