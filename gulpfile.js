require('dotenv').config();

const run = require('gulp-run');
const { task, src, dest, series, parallel, watch } = require('gulp');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const stripComments = require('gulp-strip-comments');
const sourcemaps = require('gulp-sourcemaps');
const prettier = require('gulp-prettier');
const cssnano = require('cssnano');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const flatten = require('gulp-flatten');
const log = require('fancy-log');

// rollup required plugins
const rollup = require('gulp-better-rollup');
const commonjs = require('@rollup/plugin-commonjs'); // allow rollup to use npm_modules by converting to es6 exports
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // allow rollup to parse npm_modules

//= ============================
// Configuration
//= ============================
const config = require('./config');
const isProd = process.env.NODE_ENV === 'production';

//= ============================
// Stream Handlers
//= ============================

// static
function staticStream() {
  const copyStream = new Promise((resolve) =>
    src(config.streamPaths.static)
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  );
  const imgStream = new Promise((resolve) =>
    src(config.streamPaths.images)
      .pipe(imagemin({ verbose: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  );
  return Promise.all([copyStream, imgStream]);
}

// scripts
function scriptStream() {
  return new Promise((resolve) =>
    src(config.streamPaths.scripts)
      .pipe(sourcemaps.init())
      .pipe(
        rollup(
          {
            plugins: [
              commonjs(),
              nodeResolve({ preferBuiltins: true, browser: true }),
            ],
          },
          'iife'
        )
      )
      .pipe(stripComments())
      .pipe(
        gulpif(
          isProd,
          terser({
            compress: {
              drop_console: true, // removes console logs, set to false to keep them
            },
          })
        )
      )
      .pipe(rename({ extname: '.min.js' }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  );
}

// styles
function styleStream() {
  return new Promise((resolve, reject) =>
    src(config.streamPaths.styles)
      .pipe(gulpif(!isProd, prettier()))
      .pipe(gulpif(isProd, cssnano()))
      .pipe(
        postcss().on('error', (err) => {
          log(err);
          reject(err);
        })
      )
      .pipe(rename({ extname: '.min.css' }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
      .on('error', reject)
  );
}

//= ============================
// TASKS
//= ============================
task('static', () => staticStream());
task('build:js', () => scriptStream());
task('build:css', () => styleStream());
task('build', parallel('static', 'build:js', 'build:css'));

task('watch', (done) => {
  watch(config.watchPaths.scripts, series('build:js'));
  watch(config.watchPaths.styles, series('build:css'));
  watch(config.watchPaths.static, series('static'));
  done();
});

task('shopify:dev', (done) =>
  run(`shopify theme dev --store ${process.env.STORE_URL} --path shopify`, {
    verbosity: 3,
  })
    .exec()
    .on('end', done)
    .on('error', done)
);

task('dev', parallel('watch', 'shopify:dev'));

task('deploy:staging', (done) =>
  run(
    `shopify theme push --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done)
);

task('deploy:prod', (done) =>
  run(
    `shopify theme push --theme ${process.env.LIVE_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done)
);

task('sync', (done) =>
  run(
    `shopify theme pull --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done)
);
