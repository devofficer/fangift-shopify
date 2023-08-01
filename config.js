const streamPaths = {
  scripts: 'src/scripts/pages/**/*.js',
  styles: ['src/styles/**/*.css', '!src/styles/components/**/*.css', '!src/styles/lib/**/*.css'],
  static: ['static/**/*', '!static/images/**/*'],
  images: 'static/images/**/*',
  assets: './shopify/assets',
};

const watchPaths = {
  scripts: 'src/scripts/**/*.js',
  styles: ['src/styles/**/*.css', './shopify/**/*.{liquid,json}', 'src/**/*.js'],
  static: ['static/**/*', '!static/images/**/*'],
  images: 'static/images/**/*',
};

module.exports = {
  streamPaths,
  watchPaths,
};
