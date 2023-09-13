const path = require('path');
const del = require('del');
const dotenv = require('dotenv');

dotenv.config();

const run = require('gulp-run');
const { task, src, dest, series, parallel, watch } = require('gulp');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const stripComments = require('gulp-strip-comments');
const sourcemaps = require('gulp-sourcemaps');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const flatten = require('gulp-flatten');
const cachced = require('gulp-cached');
const log = require('fancy-log');
const wrap = require('gulp-wrap');
const handlebars = require('gulp-handlebars');
const replace = require('gulp-replace');

// rollup required plugins
const rollup = require('gulp-better-rollup');
const commonjs = require('@rollup/plugin-commonjs'); // allow rollup to use npm_modules by converting to es6 exports
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // allow rollup to parse npm_modules

/**
 * Configuration
 */
const config = require('./config');

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
function scriptStream(filepath, isProd = false) {
  return new Promise((resolve) => {
    const stream = src(filepath || config.streamPaths.scripts)
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
      );

    for (const key in process.env) {
      stream.pipe(replace(`process.env.${key}`, `'${process.env[key]}'`));
    }

    stream.pipe(rename({ extname: '.min.js' }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
  });
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
      // .pipe(cssnano())
      .pipe(rename({ extname: '.min.css' }))
      .pipe(size({ showFiles: true }))
      .pipe(flatten())
      .pipe(dest(config.streamPaths.assets))
      .on('end', resolve)
      .on('error', reject)
  );
}

// templates
function templateStream(filepath) {
  return new Promise((resolve, reject) =>
    // Load templates from the src/templates/ folder relative to where gulp was executed
    src(filepath || config.streamPaths.templates)
      // Compile each Handlebars template source file to a template function
      .pipe(handlebars())
      .pipe(flatten())
      .pipe(wrap(`import { template } from "handlebars"; export default template(<%= contents %>)`))
      .pipe(dest(config.streamPaths.templatesOutput))
      .on('end', resolve)
      .on('error', reject)
  )
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

  // templates
  watch(config.watchPaths.templates).on('add', (path) => templateStream(path));
  watch(config.watchPaths.templates).on('change', (path) => templateStream(path));
  watch(config.watchPaths.templates).on('unlink', (path) => {
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
  run(
    `shopify theme dev --store ${process.env.STORE_URL} --path shopify`,
    {
      verbosity: 3,
    }
  )
    .exec()
    .on('end', done)
    .on('error', done)
}

function buildTheme(envPath = '.env.dev') {
  dotenv.config({ path: envPath, override: true });
  return Promise.all([
    staticStream(),
    imageStream(),
    scriptStream(),
    templateStream(),
    styleStream()
  ]);
}

function deploy(done) {
  run(
    `shopify theme push --theme ${process.env.DEV_THEME_ID} --store ${process.env.STORE_URL} --path shopify --allow-live`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function deployStage(done) {
  run(
    `shopify theme push --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify --allow-live`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function deployProd(done) {
  run(
    `shopify theme push --theme ${process.env.LIVE_THEME_ID} --store ${process.env.STORE_URL} --path shopify --allow-live`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function sync(done) {
  return run(
    `shopify theme pull --theme ${process.env.DEV_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function syncStage(done) {
  return run(
    `shopify theme pull --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
    { verbosity: 3 }
  )
    .exec()
    .on('end', done);
}

function syncProd(done) {
  return run(
    `shopify theme pull --theme ${process.env.LIVE_THEME_ID} --store ${process.env.STORE_URL} --path shopify`,
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
task('sync:stage', syncStage);
task('sync:prod', syncProd);

/**
 * Build Tasks
 */
task('static', () => staticStream());
task('image', () => imageStream());
task('build:js', () => scriptStream());
task('build:template', () => templateStream());
task('build:css', () => styleStream());

task('build', () => buildTheme('.env.dev'));
task('build:prod', () => buildTheme('.env.prod'));
task('build:stage', () => buildTheme('.env.stage'));

task('deploy', deploy);
task('deploy:stage', deployStage);
task('deploy:prod', deployProd);
