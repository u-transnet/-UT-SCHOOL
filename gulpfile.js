var gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat-js'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber');

gulp.task('build', function() {
    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['es2015', 'stage-0', 'stage-1'],
                plugins: ["transform-decorators-legacy"]
            }))
            .pipe(concat({
                entry: "./main.js",
                target: "app.js"
            }))
            .pipe(gulp.dest('build'))
            .pipe(rename('app.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('build'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build'));
});

gulp.task('build-cli', function() {
    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015', 'stage-0', 'stage-1'],
            plugins: ["transform-decorators-legacy"]
        }))
        .pipe(concat({
            entry: "./cli.js",
            target: "cli.js"
        }))
        .pipe(gulp.dest('build'));
});
