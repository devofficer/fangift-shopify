module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["shopify/**/*.liquid", "src/**/*.{js,ts,css,svg,jsx,tsx,liquid}"],
  theme: {
    screens: {
      'sm': '576px',
      // => @media (min-width: 576px) { ... }

      'md': '960px',
      // => @media (min-width: 960px) { ... }

      'lg': '1440px',
      // => @media (min-width: 1440px) { ... }
    },
  },
  plugins: [],
};
