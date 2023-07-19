require('dotenv').config();

const path = require('path');
const del = require('del');

const run = require('gulp-run');
const { task, src, dest, series, parallel, watch } = require('gulp');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const stripComments = require('gulp-strip-comments');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const flatten = require('gulp-flatten');
const cachced = require('gulp-cached');
const log = require('fancy-log');

// rollup required plugins
const rollup = require('gulp-better-rollup');
const commonjs = require('@rollup/plugin-commonjs'); // allow rollup to use npm_modules by converting to es6 exports
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // allow rollup to parse npm_modules

/**
 * Configuration
 */
const config = require('./config');
const isProd = process.env.NODE_ENV === 'production';

/**
 * Stream Handlers
 */

// static
function staticStream(filepath) {
  return new Promise((resolve) =>
    src(filepath || config.streamPaths.static)
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  );
}

// images
function imageStream(filepath) {
  return new Promise((resolve) =>
    src(filepath || config.streamPaths.images)
      .pipe(imagemin({ verbose: true }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  );
}

// scripts
function scriptStream(filepath) {
  return new Promise((resolve) =>
    src(filepath || config.streamPaths.scripts)
      .pipe(sourcemaps.init())
      .pipe(
        rollup(
          {
            plugins: [
              commonjs(),
              nodeResolve({ preferBuiltins: true, browser: true }),
            ],
            external: [
              "./node_modules/dist/jquery.min.js",
              "./node_modules/jquery-ui/dist/jquery-ui.min.js"
            ],
          },
          'iife'
        )
      )
      .pipe(cachced())
      .pipe(stripComments())
      .pipe(
        gulpif(
          isProd,
          terser({
            compress: {
              drop_console: true,
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
function styleStream(filepath) {
  return new Promise((resolve, reject) =>
    src(filepath || config.streamPaths.styles)
      .pipe(
        postcss().on('error', (err) => {
          log(err);
          reject(err);
        })
      )
      .pipe(cssnano())
      .pipe(rename({ extname: '.min.css' }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
      .on('error', reject)
  );
}

function watchHandler(done) {
  const deleteFile = (filepath, isMinified = false) => {
    let filename = path.basename(filepath);
    if (isMinified) {
      const ext = path.extname(filename);
      filename = filename.replace(new RegExp(`${ext}$`), `.min${ext}`);
    }
    const destFilePath = path.resolve(config.streamPaths.assets, filename);
    del.sync(destFilePath);
  };

  // javascript
  watch(config.watchPaths.scripts).on('add', series('build:js'));
  watch(config.watchPaths.scripts).on('change', series('build:js'));
  watch(config.watchPaths.scripts).on('unlink', (path) => {
    deleteFile(path, true);
  });

  // css
  watch(config.watchPaths.styles).on('add', series('build:css'));
  watch(config.watchPaths.styles).on('change', series('build:css'));
  watch(config.watchPaths.styles).on('unlink', (path) => {
    deleteFile(path, true);
  });

  // images
  watch(config.watchPaths.images).on('add', (path) => imageStream(path));
  watch(config.watchPaths.images).on('change', (path) => imageStream(path));
  watch(config.watchPaths.images).on('unlink', (path) => {
    deleteFile(path, false);
  });

  // static
  watch(config.watchPaths.static).on('add', (path) => staticStream(path));
  watch(config.watchPaths.static).on('change', (path) => staticStream(path));
  watch(config.watchPaths.static).on('unlink', (path) => {
    deleteFile(path, false);
  });

  done();
}

function devShopify(done) {
  return run(
    `shopify theme dev --store ${process.env.STORE_URL} --path shopify`,
    {
      verbosity: 3,
    }
  )
    .exec()
    .on('end', done)
    .on('error', done);
}

function deploy(done) {
  return run(
    `shopify theme push --theme ${isProd ? process.env.LIVE_THEME_ID : process.env.STAGING_THEME_ID
    } --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function sync(done) {
  return run(
    `shopify theme pull --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

/**
 * Dev Tasks
 */
task('shopify:dev', devShopify);
task('watch', watchHandler);
task('dev', parallel('watch', 'shopify:dev'));
task('sync', sync);

/**
 * Build Tasks
 */
task('static', () => staticStream());
task('image', () => imageStream());
task('build:js', () => scriptStream());
task('build:css', () => styleStream());
task('build', parallel('static', 'image', 'build:js', 'build:css'));
task('deploy', deploy);
