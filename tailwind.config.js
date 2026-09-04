/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-cyan-500/10', 'bg-blue-500/10', 'bg-teal-500/10', 'bg-rose-500/10',
    'bg-amber-500/10', 'bg-orange-500/10', 'bg-red-500/10', 'bg-emerald-500/10',
    'text-cyan-400', 'text-blue-400', 'text-teal-400', 'text-rose-400',
    'text-amber-400', 'text-orange-400', 'text-red-400', 'text-emerald-400',
    'bg-cyan-400', 'bg-blue-400', 'bg-teal-400', 'bg-rose-400',
    'bg-amber-400', 'bg-orange-400', 'bg-red-400', 'bg-emerald-400',
    'border-cyan-500/20', 'border-blue-500/20', 'border-teal-500/20', 'border-rose-500/20',
    'border-amber-500/20', 'border-orange-500/20', 'border-red-500/20', 'border-emerald-500/20',
    'border-cyan-500/30', 'border-blue-500/30', 'border-teal-500/30', 'border-rose-500/30',
    'border-amber-500/30', 'border-orange-500/30', 'border-red-500/30', 'border-emerald-500/30',
    'bg-cyan-400/60', 'bg-blue-400/60', 'bg-teal-400/60', 'bg-rose-400/60',
    'bg-amber-400/60', 'bg-orange-400/60', 'bg-red-400/60', 'bg-emerald-400/60',
  ],
};
