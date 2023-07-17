const streamPaths = {
  scripts: 'src/**/*.js',
  styles: ['src/styles/**/*.css', '!src/styles/components/**/*.css'],
  static: ['static/**/*', '!static/images/**/*'],
  images: 'static/images/**/*',
  assets: './shopify/assets',
};

const watchPaths = {
  scripts: 'src/**/*.js',
  styles: ['src/styles/**/*.css', './shopify/**/*.{liquid,json}'],
  static: ['static/**/*', '!static/images/**/*'],
  images: 'static/images/**/*',
};

module.exports = {
  streamPaths,
  watchPaths,
};
