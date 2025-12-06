/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}

{/*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 */}