/* Copyright 2014 nb.io, LLC */

'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var envify = require('envify');
var fs = require("fs");
var prettyHrtime = require('pretty-hrtime');
var sass = require('gulp-ruby-sass');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var url = require("url")
var watchify = require('watchify');
var connect = require('gulp-connect');


// Production?

var PROD = (process.env.NODE_ENV == 'production');


// Utilities

var bundleLogger = {
  start: function() {
    global.startTime = process.hrtime();
    $.util.log('Running', $.util.colors.green("'bundle'") + '...');
  },

  end: function() {
    var taskTime = process.hrtime(global.startTime);
    var prettyTime = prettyHrtime(taskTime);
    $.util.log('Finished', $.util.colors.green("'bundle'"), 'in', $.util.colors.magenta(prettyTime));
  }
};

var handleErrors = function() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to Notification Center with gulp-notify
  $.notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};


// Browserify (JS) task

gulp.task('browserify', function() {
  var bundler = browserify({
    // Required Watchify args
    cache: {},
    packageCache: {},
    fullPaths: true,
    entries: ['./src/scripts/index.js'],
    extensions: ['.js'],
    debug: true
  });

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
      .transform(envify)
      .bundle()
      .on('error', handleErrors) /* Report compile errors */
      .pipe(source('index.js')) /* Use vinyl-source-stream to make the stream Gulp compatible. */
      .pipe(buffer())
      .pipe($.if(PROD, $.uglify())) /* Compress JavaScript with Uglify */
      .pipe(gulp.dest('./dist/_/scripts/')) /* Specify the output destination */
      .on('end', bundleLogger.end); /* Log when bundling completes! */
  };

  // Rebundle with Watchify on changes.
  if (global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }

  return bundle();
});


// SASS task

gulp.task('sass', ['images'], function() {
  return gulp.src('src/styles/*.{sass, scss, css}')
    .pipe(sass())
    .on('error', handleErrors)
    .pipe(gulp.dest('dist/_/styles'));
});


// Images task

gulp.task('images', function() {
  var dest = './dist/_/images';
  return gulp.src('./src/images/**')
    .pipe($.changed(dest)) /* Ignore unchanged files */
    .pipe($.imagemin()) /* Optimize */
    .pipe(gulp.dest(dest));
});


// HTML task

gulp.task('html', function() {
  return gulp.src('src/**.html')
    .pipe(gulp.dest('dist'));
});


// Build task

gulp.task('build', ['browserify', 'sass', 'images', 'html']);


// Watch task

gulp.task('watch', ['setWatch', 'connect'], function() {
  gulp.watch('src/styles/**', ['sass']);
  gulp.watch('src/images/**', ['images']);
  gulp.watch('src/**.html', ['html']);
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});


// Connect task

gulp.task('connect', ['build'], function() {
  connect.server({
    root: ['dist'],
    fallback: 'dist/index.html',
    port: process.env.PORT || 8087,
    livereload: true
  });
});


// Default task

gulp.task('default', ['watch']);


// Heroku task

gulp.task('heroku', ['build']);
