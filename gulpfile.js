var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('build', function() {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015', 'stage-0', 'stage-1'],
            plugins: ["transform-decorators-legacy"]
        }))
        .pipe(gulp.dest('build'));
});
