/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  darkMode: ['selector', '[class="my-app-dark"]'],
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {

      width: {
        'dialog-sm': '25rem',
        'dialog-lg': '100rem',
      },
      height: {
        'dialog-sm': '25rem',
        'dialog-m': '30rem',
        'dialog-lg': '100rem',
      },
    },
  },
  plugins: [PrimeUI],
}

