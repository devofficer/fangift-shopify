module.exports = {
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': 'prettier --write',
  'src/**/*.js': ['eslint --fix', 'prettier --write'],
  'src/**/*.css': 'prettier --write',
};
