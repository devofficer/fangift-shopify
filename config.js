const streamPaths = {
  scripts: "src/**/*.{js,jsx,ts,tsx}",
  styles: ["src/styles/**/*.css", "!src/styles/components/**/*.css"],
  images: "static/images/**/*",
  static: ["static/**/*", "static/images/**/*"],
  assets: "./shopify/assets",
};

const watchPaths = {
  scripts: "src/**/*.{js,jsx,ts,tsx}",
  styles: ["src/styles/**/*.css", "./shopify/**/*.{liquid,json}"],
  static: "static/**/*",
};

module.exports = {
  streamPaths,
  watchPaths,
};
