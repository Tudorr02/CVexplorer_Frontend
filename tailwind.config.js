/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  darkMode: ['selector', '[class="my-app-dark"]'],
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors : {
        // preiei culorile din tema PrimeNG
        primary: 'var(--p-primary-color)',
        'primary-dark': 'var(--p-primary-hover-color)',
        surface: 'var(--p-surface-0)',
        'surface-100': 'var(--p-surface-100)',
        text: 'var(--p-text-color)',
      },
      borderRadius: {
        // preiei border-radius definit de PrimeNG
        md: 'var(--p-border-radius-md)',
      }
    },
  },
  plugins: [PrimeUI],
}

