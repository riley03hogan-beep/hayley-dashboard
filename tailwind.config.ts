import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        redbird: {
          50: '#fff1f2',
          100: '#ffe3e6',
          500: '#ce1126',
          600: '#b20f21',
          700: '#8f1020',
        },
        paper: '#fffdf9',
        ink: '#241f21',
      },
      boxShadow: {
        soft: '0 18px 48px rgba(50, 33, 33, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
