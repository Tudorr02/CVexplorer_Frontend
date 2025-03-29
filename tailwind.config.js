/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  darkMode: ['selector', '[class="my-app-dark"]'],
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [PrimeUI],
}

