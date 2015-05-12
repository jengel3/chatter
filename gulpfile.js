var pkg = require('./package');

var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rjs = require('gulp-requirejs');

var browserify = require('browserify');;

var glob = require('glob-array');
var rm = require('gulp-rimraf');
var NwBuilder = require('node-webkit-builder');

// Build nwjs application
gulp.task('build', ['clean'], function() {
  var nw = new NwBuilder({
    appName: pkg.window.title,
    appVersion: pkg.version,
    buildDir: 'dist',
    files: ['package.json', 'src/**'],
    macIcns: 'src/img/icon.icns',
    platforms: ['win','osx'],
    version: '0.10.1'
  });

  nw.on('log', gutil.log);

  return nw.build().catch(gutil.log);
});

gulp.task('serve', shell.task([
  'node node_modules/nw/bin/nw . --debug'
  ]));


gulp.task('watch', function () {
  gulp.watch(['app/modules/**/*', 'app/styles/*.css', 'app/*'], ['compile']);
});

gulp.task('clean', function() {
  return gulp.src('dist/*').pipe(rm());
});

gulp.task('rjs', ['clean'], function() {
   rjs({
    mainConfigFile: "app/config.js",
    include: ["main"],
    out: "source.js",
    baseUrl: "app",
    wrap: true,
  })
  .pipe(gulp.dest('./dist/js/'))
  .pipe(rename('source.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js/'));
});

gulp.task('uglify', ['rjs'], function() {
   gulp.src('dist/js/*.js')
  .pipe(rename('source.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', ['clean'], function () {
   gulp.src(['./app/styles/*.css'])
  .pipe(rename('app.css'))
  .pipe(minifyCSS())
  .pipe(gulp.dest('./dist/css/'));
});


gulp.task('fonts', ['clean'], function () {
   gulp.src(['./app/styles/fonts/**'], { "base" : "./app/styles/fonts/" })
   .pipe(gulp.dest('./dist/css/fonts/'));
});

gulp.task('compile', ['clean', 'rjs', 'css', 'fonts']);
gulp.task('default', ['compile', 'serve', 'watch']);