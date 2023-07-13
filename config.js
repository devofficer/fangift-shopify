const config = {
  srcImg: "src/images/**/*.{jpg,jpeg,png,gif,svg}",
  srcJS: "src/**/*.{js,jsx,ts,tsx}",
  srcStyles: "src/styles/**/*.css",
  rootDist: "shopify/**/*.{liquid, json}",
  dest: "./shopify/assets",
  tailwindConfig: "./tailwind.config.js",
};

module.exports = config;
