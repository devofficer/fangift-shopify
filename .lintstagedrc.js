module.exports = {
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.{liquid,json,md}': 'prettier --write',
  'src/**/*.js': ['eslint --fix', 'prettier --write'],
  'src/**/*.css': 'prettier --write',
};
