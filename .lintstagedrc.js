module.exports = {
  'src/**/*.js': ['eslint --fix', 'prettier --write'],
  'src/**/*.css': 'prettier --write',
  '*.{liquid,json,md}': 'prettier --write',
};
