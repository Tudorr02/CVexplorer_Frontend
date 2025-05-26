/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  darkMode: ['selector', '[class="my-app-dark"]'],
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {

      width: {
        'dialog-sm': '25rem',
        'dialog-m': '30rem',
        'dialog-m2': '50rem',
        'dialog-lg': '100rem',
      },
      height: {
        'dialog-xs': '15rem',
        'dialog-sm': '25rem',
        'dialog-m': '30rem',
        'dialog-m2': '40rem',
        'dialog-lg': '50rem',
      },
      boxShadow: {
        '9': '0px 9px 46px 8px rgba(0, 0, 0, 0.12), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 11px 15px rgba(0, 0, 0, 0.2)',
      },
       fontFamily: {
        lexend: ['Lexend', 'ui-sans-serif','system-ui'],
      },
      
    },
  },
  plugins: [PrimeUI]
}

