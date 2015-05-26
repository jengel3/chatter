var pkg = require('./package');

var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rjs = require('gulp-requirejs');

var rm = require('gulp-rimraf');
var NwBuilder = require('node-webkit-builder');

// Build nwjs app
gulp.task('build', ['compile', 'fonts', 'images'], function() {
  var nw = new NwBuilder({
    appName: pkg.window.title,
    appVersion: pkg.version,
    buildDir: 'build',
    files: ['package.json', 'app/**', 'dist/**', 'vendor/components/**/*', 'index.html', 
    "node_modules/**", "!node_modules/gulp*/**", "!node_modules/bower/**", 
    "!node_modules/duplexify/**", "!node_modules/node-webkit-builder/**", "!node_modules/*glob*/**", 
    "!node_modules/read-all-stream/**", "!node_modules/nw/nwjs/chatter*",
    "!node_modules/unique-stream/**", "!node_modules/vinyl-fs/**", "!node_modules/rimraf/**", 
    "!node_modules/nw/**", "!node_modules/through2/**", "!node_modules/irc/node_modules/iconv/**"],
    platforms: ['win64', 'linux64'],
    winIco: './dist/images/chatter.ico',
    version: '0.12.1'
  });

  nw.on('log', console.log);

  return nw.build().catch(console.log);
});

gulp.task('serve', ['compile'], shell.task([
  'node node_modules/nw/bin/nw . --debug'
  ]));


gulp.task('watch', function () {
  gulp.watch(['app/modules/**/*', 'app/styles/*.css', 'app/*'], ['compile']);
});


gulp.task('rjs', function() {
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

gulp.task('css', function () {
 gulp.src(['./app/styles/*.css'])
 .pipe(rename('app.css'))
 .pipe(minifyCSS())
 .pipe(gulp.dest('./dist/css/'));
});


gulp.task('fonts', function () {
 gulp.src(['./app/styles/fonts/**'], { "base" : "./app/styles/fonts/" })
 .pipe(gulp.dest('./dist/css/fonts/'));
});

gulp.task('images', function () {
 gulp.src(['./app/images/*'])
 .pipe(gulp.dest('./dist/images/'));
});


gulp.task('compile', ['rjs', 'css', 'images']);
gulp.task('default', ['compile', 'serve', 'watch']);