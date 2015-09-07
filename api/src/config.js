import environments from '../../environments';

let database = 'postgres://127.0.0.1:5432/db';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const env = environments.development;
  database = `postgres://${env.username}:${env.password}@${env.host}:5432/db`;
}

export default {
  database
};