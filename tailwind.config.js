module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "shopify/**/*.liquid",
    "src/**/*.{js,ts,css,svg,jsx,tsx,liquid,hbs}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e1e1e",
          black: "#1e1e1e",
          text: "#575757",
          white: "#ffffff",
          gray: "#e0e0e0",
          border: "#d9d9d9",
          background: "#fafafa",
        },
        accent: {
          DEFAULT: "#d853f9",
          purple: "#d853f9",
          blue: "#8ebafd",
          peach: "#fd8e8e",
        },
        yellow: '#fbc917',
        green: '#75daba',
      },
      fontFamily: {
        "plus-regular": ["PlusJakartaSans-Regular"],
        "plus-medium": ["PlusJakartaSans-Medium"],
        "plus-semi": ["PlusJakartaSans-SemiBold"],
        "plus-bold": ["PlusJakartaSans-Bold"],
      },
      container: {
        center: true,
      },
      screens: {
        "2xl": "1440px",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
