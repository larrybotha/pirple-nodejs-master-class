import * as dotenv from 'dotenv';
import * as http from 'http';
import * as url from 'url';

dotenv.config();

const server: http.Server = http.createServer((_, res: http.ServerResponse) => {
  res.end('Hello world\n');
});
const port = process.env.PORT || 3000;

server.listen(port, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port}`);
});
