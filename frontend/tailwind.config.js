/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
       maxWidth: {
             "20rem": "20rem",
             "25rem": "25rem",
           },
           minWidth: {
             "10rem": "10rem",
           },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        baloo: ['"Baloo 2"', "sans-serif"],
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
