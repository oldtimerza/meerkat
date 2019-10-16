const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const sveltify = require('sveltify');
const source = require('vinyl-source-stream');

exports.default = function () {
  return browserify('./src/app.js')
    .transform(sveltify, { extensions: ['.svelte'] })
    .transform(babelify, { presets: ['@babel/preset-env'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
};
