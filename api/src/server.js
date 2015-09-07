import express from 'express';
import config from './config';

const app = express();

let clientPort = 80;

if (app.get('env') === 'development') {
  clientPort = 8080;
}

app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ greeting: config.database });
});

const server = app.listen(3000, () => {
  console.log(`Server listening http://localhost:${server.address().port}`);
});