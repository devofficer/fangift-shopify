const config = {
  plugins: [
    require("postcss-import"),
    require("@tailwindcss/nesting"),
    require("tailwindcss"),
    require("autoprefixer"),
    require("postcss-discard-overridden"),
  ],
};

module.exports = config;
