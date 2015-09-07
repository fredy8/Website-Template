var plan = require('flightplan');
var environments = require('./environments');

for (environment in environments) {
  if (environments.hasOwnProperty(environment)) {
    var env = environments[environment];
    plan.target(environment, {
      host: env.host,
      username: env.username,
      password: env.password,
      agent: process.env.SSH_AUTH_SOCK
    });
  }
}

var updateApt = function (transport) {
  transport.sudo('apt-get update');
}

var installDB = function (transport) {
  transport.sudo('sudo apt-get install -y postgresql postgresql-contrib');
  transport.sudo('mkdir -p /var/log/postgres');
  transport.sudo('touch /var/log/postgres/logfile.txt');
  transport.sudo('echo \'/usr/local/pgsql/bin/pg_ctl start -l ~/postgres/logfile.txt -D /usr/local/pgsql/data\' >> /etc/rc.local');
};

plan.remote('setup-dev-env', function (transport) {
  updateApt();
  installDB(transport);

  // allow remote access to db
  // port 5432 should be open
  transport.exec('sudo -u postgres sed -i -e "s/#listen_addresses = \'localhost\'/listen_addresses = \'*\'/g" /etc/postgresql/$(psql -V | cut -d" " -f3 | cut -d"." -f-2)/main/postgresql.conf');
  transport.exec('echo \'host all all 0.0.0.0/0 trust\' | sudo -u postgres tee -a /etc/postgresql/$(psql -V | cut -d" " -f3 | cut -d"." -f-2)/main/pg_hba.conf');
  transport.sudo('/etc/init.d/postgresql restart');
  transport.log('Don\'t forget to open port 5432');
});

plan.remote('setup-prod-env', function (transport) {
  updateApt(transport);
  installDB(transport);

  transport.exec('echo "export NODE_ENV=production" >> ~/.profile');

  transport.sudo('apt-get install -y build-essential libssl-dev nginx');
  transport.sudo('mkdir -p /data/www');

  // node server
  // port 3000 should be open
  transport.exec('wget https://iojs.org/dist/v3.3.0/iojs-v3.3.0-linux-x64.tar.gz');
  transport.exec('tar zxf iojs-v3.3.0-linux-x64.tar.gz');
  transport.exec('rm iojs-v3.3.0-linux-x64.tar.gz');
  transport.sudo('cp iojs-v3.3.0-linux-x64/bin/* /usr/bin');
  transport.exec('rm -rf iojs-v3.3.0-linux-x64');
  transport.sudo('mkdir -p /home/node/api/');
  transport.sudo('apt-get install -y npm');
  transport.sudo('npm install forever -g');
  transport.log('Don\'t forget to open port 3000');
});

var tmpDir = 'deploy-' + new Date().getTime();

plan.local('deploy', function (local) {
  var buildFiles = local.exec('(find client/build api/build api/package.json nginx.conf -type f)', { silent: true });
  local.transfer(buildFiles, '/tmp/' + tmpDir);
});

plan.remote('deploy', function (transport) {
  transport.sudo('rm -rf /data/www');
  transport.sudo('rm -rf /home/node/api');
  transport.sudo('mkdir /data/www');
  transport.sudo('mkdir /home/node/api');
  transport.sudo('cp -R /tmp/' + tmpDir + '/client/build/* /data/www');
  transport.sudo('cp -R /tmp/' + tmpDir + '/api/build/* /home/node/api');
  transport.sudo('cp /tmp/' + tmpDir + '/api/package.json /home/node/api');
  transport.sudo('mv /tmp/' + tmpDir + '/nginx.conf /etc/nginx/nginx.conf');
  transport.sudo('find /data/www -type f -exec sed -i "s/{{API_LOCATION}}/http:\\\/\\\/' + plan.runtime.hosts[0].host + ':3000/g" {} +');
  transport.exec('cd /home/node/api && NODE_ENV=production sudo -E npm install');
  transport.sudo('nginx -s reload');
  transport.sudo('/home/node/api/node_modules/.bin/forever stop api || true');
  transport.sudo('/home/node/api/node_modules/.bin/forever start -a --uid "api" /home/node/api/server.js');
});