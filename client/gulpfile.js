var child_process = require('child_process');
var spawn = child_process.spawn;
var exec = child_process.exec;
var gulp = require('gulp');

gulp.task('lint', function () {
  spawn('node_modules/.bin/eslint', ['.', '--ext', '.js', '--ext', '.jsx',
    '--ignore-path', '.eslintignore'],
    { stdio: 'inherit' });
});

gulp.task('clean', function (cb) {
  exec('rm -rf build', cb);
});

gulp.task('build', ['clean'], function (cb) {
  exec('node_modules/.bin/webpack', { stdio: 'inherit' }, cb);
});

gulp.task('test', function () {
  spawn('node_modules/.bin/jest', [], { stdio: 'inherit' });
});

gulp.task('start', function (cb) {
  exec('node_modules/.bin/webpack-dev-server', cb);
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.js', 'src/**/*.jsx'], ['lint', 'test']);
});
