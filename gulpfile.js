'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');


gulp.task('default', ['nodemon'], function () {
});


gulp.task('nodemon', function (cb) {

	var started = false;

	return nodemon({
		script: 'server.dev.js',
    execMap: {
      js: "babel-node --debug"
    },
		watch: ["src/server/*"]
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true;
		}
	});
});
