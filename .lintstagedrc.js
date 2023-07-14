module.exports = {
  "./src/**/*.css": ['prettier --write', () => "gulp build:css"],
  "./src/**/*.js": ['prettier --write', () => "gulp build:js"]
};
