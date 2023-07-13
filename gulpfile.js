require("dotenv").config();
const run = require("gulp-run");
const { task, src, dest, series, parallel, watch } = require("gulp");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const stripComments = require("gulp-strip-comments");
const sourcemaps = require("gulp-sourcemaps");
const prettier = require("gulp-prettier");
const cssnano = require("cssnano");
const size = require("gulp-size");
const imagemin = require("gulp-imagemin");
const gulpif = require("gulp-if");
const postcss = require("gulp-postcss");
const filter = require("gulp-filter"); 
const log = require('fancy-log');

//rollup required plugins
const rollup = require("gulp-better-rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve"); //allow rollup to parse npm_modules
const commonjs = require("@rollup/plugin-commonjs"); //allow rollup to use npm_modules by converting to es6 exports

//=============================
// Configuration
//=============================
const config = require("./config");
const isProd = process.env.NODE_ENV === "production" ? true : false;

// image stream
function imageStream(srcPath) {
  return new Promise((resolve) =>
    src(srcPath)
      .pipe(imagemin({ verbose: true }))
      .pipe(size({ showFiles: true }))
      .pipe(dest(config.dest))
      .on("end", resolve)
  );
}

function copyStatic() {
  return new Promise((resolve) =>
    src("./node_modules/flowbite/dist/flowbite.min.js")
      .pipe(dest(config.dest))
      .on("end", resolve)
  );
}

// js stream
function jsBuildStream(srcPath) {
  return new Promise((resolve) =>
    src(srcPath)
      .pipe(sourcemaps.init())
      .pipe(
        rollup(
          {
            plugins: [
              commonjs(),
              nodeResolve({ preferBuiltins: true, browser: true }),
            ],
          },
          "iife"
        )
      )
      .pipe(stripComments())
      .pipe(
        gulpif(
          isProd,
          terser({
            compress: {
              drop_console: true, //removes console logs, set to false to keep them
            },
          })
        )
      )
      .pipe(rename({ extname: ".min.js" }))
      .pipe(size({ showFiles: true }))
      .pipe(dest(config.dest))
      .on("end", resolve)
  );
}

// css stream
function cssBuildStream(srcPath) {
  return new Promise((resolve, reject) =>
    src(srcPath)
      .pipe(filter('./src/styles/*.css')) // ignore children dependancy styles
      .pipe(gulpif(!isProd, prettier()))
      .pipe(gulpif(isProd, cssnano()))
      .pipe(postcss().on("error", (err) => {
        log(err);
        resolve();
      }))
      .pipe(rename({ extname: ".min.css" }))
      .pipe(size({ showFiles: true }))
      .pipe(dest(config.dest))
      .on("end", resolve)
      .on("error", reject)
  );
}

//=============================
// TASKS
//=============================
task("prepare", () => copyStatic());
task("build:img", () => imageStream(config.srcImg));
task("build:js", () => jsBuildStream(config.srcJS));
task("build:css", () => cssBuildStream(config.srcStyles));
task("build", parallel("prepare", "build:img", "build:js", "build:css"));
task("watch", (done) => {
  watch(config.srcJS, series("build:js"));
  watch(config.srcStyles, series("build:css"));
  watch(config.srcImg, series("build:img"));
  watch(config.rootDist, series("build:css"));
  done();
});

task("shopify:dev", (done) => run(`shopify theme dev --store ${process.env.STORE_URL} --path shopify`, { verbosity: 3 })
  .exec()
  .on("end", done)
  .on("error", done)
);

task("dev", parallel("watch", "shopify:dev"));

task("deploy:staging", (done) => run(`shopify theme push --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopifyy`, { verbosity: 3 })
  .exec()
  .on("end", done)
);

task("deploy:prod", (done) => run(`shopify theme push --theme ${process.env.LIVE_THEME_ID} --store ${process.env.STORE_URL} --path shopify`, { verbosity: 3 })
  .exec()
  .on("end", done)
);

task("sync", (done) => run(`shopify theme pull --theme ${process.env.STAGING_THEME_ID} --store ${process.env.STORE_URL} --path shopify`, { verbosity: 3 })
  .exec()
  .on("end", done)
);
