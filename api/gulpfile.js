var child_process = require('child_process');
var spawn = child_process.spawn;
var exec = child_process.exec;
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('lint', function () {
  spawn('node_modules/.bin/eslint', ['.', '--ext', '.js',
    '--ignore-path', '.eslintignore'], { stdio: 'inherit' });
});

gulp.task('clean', function (cb) {
  exec('rm -rf build', cb);
});

gulp.task('build', ['clean'], function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('test', ['build'], function () {
  spawn('node_modules/.bin/mocha', [], { stdio: 'inherit' });
});

gulp.task('start', ['build'], function () {
  spawn('node_modules/.bin/nodemon', ['build/server.js'], { stdio: 'inherit' });
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.js'], ['lint', 'test']);
});
