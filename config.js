const streamPaths = {
  scripts: ['src/scripts/pages/**/*.js', 'src/scripts/components/**/*.js'],
  styles: ['src/styles/**/*.css', '!src/styles/components/**/*.css', '!src/styles/lib/**/*.css'],
  static: ['static/**/*', '!static/images/**/*'],
  templates: 'src/templates/*.hbs',
  templatesOutput: 'src/scripts/templates',
  images: 'static/images/**/*',
  assets: './shopify/assets',
};

const watchPaths = {
  scripts: 'src/scripts/**/*.js',
  styles: ['src/styles/**/*.css', './shopify/**/*.{liquid,json}', 'src/**/*.js'],
  static: ['static/**/*', '!static/images/**/*'],
  images: 'static/images/**/*',
  templates: 'src/templates/*.hbs',
};

module.exports = {
  streamPaths,
  watchPaths,
};
