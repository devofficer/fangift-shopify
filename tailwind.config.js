module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "shopify/**/*.liquid", 
    "src/**/*.{js,ts,css,svg,jsx,tsx,liquid}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e1e1e',
          black: '#1e1e1e',
          text: '#575757',
          white: '#ffffff',
        },
        accent: {
          DEFAULT: '#d853f9',
          purple: '#d853f9',
          blue: '#8ebafd',
        }
      },
      fontFamily: {
        'pjs-regular': ['PlusJakartaSans-Regular'],
        'pjs-medium': ['PlusJakartaSans-Medium'],
      },
      container: {
        center: true,
      },
      screens: {
        '2xl': '1440px',
      },
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
