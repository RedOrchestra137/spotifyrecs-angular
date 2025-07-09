/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx}",
    "./src/app/**/*.{html,ts}",
    "./projects/**/*.{html,ts}" // if using Angular workspace
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}