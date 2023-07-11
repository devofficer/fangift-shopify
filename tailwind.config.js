module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["shopify/**/*.liquid", "src/**/*.{js,ts,css,svg,jsx,tsx,liquid}"],
  theme: {
    screens: {
      'sm': '576px',
      'md': '960px',
      'lg': '1440px',
    },
    extends: {
      colors: {
        primary: {
          back: '#1e1e1e',
          text: '#575757',
          white: '#ffffff',
        },
        accent: {
          purple: '#d853f9',
        }
      },
      fontFamily: {
        'pjs-regular': ['PlusJakartaSans-Regular']
      },
      container: {
        center: true,
      },
    }
  },
  plugins: [],
};
