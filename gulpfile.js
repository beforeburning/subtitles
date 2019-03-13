/**
 User: burning <923398776@qq.com>
 Date: 2017年05月19日
 */

var gulp = require('gulp'),
  less = require('gulp-less'),
  minifyCss = require("gulp-minify-css"),
  rename = require('gulp-rename'),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  minifyHtml = require("gulp-minify-html"),
  browserSync = require('browser-sync').create(),
  babel = require("gulp-babel"),
  reload = browserSync.reload;

gulp.task('js', function () {
  gulp.src('./script/index.js')
    .pipe(concat('index.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./js/'));
});

gulp.task('browsersync', function () {
  browserSync.init({
    files: ['**'],
    server: {
      baseDir: "../"
    },
    port: 8080
  });
});

gulp.task('watch', function () {
  gulp.watch('./script/index.js', ['js']);
});

gulp.task('default', ['watch', 'browsersync']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务
