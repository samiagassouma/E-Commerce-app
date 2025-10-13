/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      animation: {
        'blink': 'blink 1.4s infinite',
      },
      keyframes: {
        blink: {
          '0%, 80%, 100%': { opacity: '0.4' },
          '40%': { opacity: '1' },
        },
      },
      animationDelay: {
        200: '0.2s',
        400: '0.4s',
      }
    },
  },
  plugins: [],
}

