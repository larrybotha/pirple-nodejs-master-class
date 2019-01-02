import * as http from 'http';

const port = 3000;

const server: http.Server = http.createServer((_, res: http.ServerResponse) => {
  res.end('Hello world\n');
});

server.listen(port, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port}`);
});
