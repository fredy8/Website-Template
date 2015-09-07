var gulp = require('gulp');
var child_process = require('child_process');
var exec = child_process.exec;
var spawn = child_process.spawn;
var environments = require('./environments');

gulp.task('test', function (cb) {
  exec('((node_modules/.bin/webdriver-manager start > /dev/null) &) && sleep 1 && node_modules/.bin/nightwatch && (curl -s http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer)',
    { stdio: 'inherit' }, cb);
});

gulp.task('build-client', function (cb){
  exec('cd client && gulp build', { stdio: 'inherit' }, cb);
});

gulp.task('build-api', function (cb){
  exec('cd api && gulp build', { stdio: 'inherit' }, cb);
});

var registerFlights = function (environment) {
  gulp.task('deploy-' + environment, ['build-client', 'build-api'], function () {
    spawn('fly', ['deploy:' + environment], { stdio: 'inherit' });
  });

  gulp.task('setup-dev-env-' + environment, ['build-client', 'build-api'], function () {
    spawn('fly', ['setup-dev-env:' + environment], { stdio: 'inherit' });
  });

  gulp.task('setup-prod-env-' + environment, ['build-client', 'build-api'], function () {
    spawn('fly', ['setup-prod-env:' + environment], { stdio: 'inherit' });
  });
}

for (environment in environments) {
  if (environments.hasOwnProperty(environment)) {
    registerFlights(environment);
  }
}