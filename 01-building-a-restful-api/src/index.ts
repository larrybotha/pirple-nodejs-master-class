import * as dotenv from 'dotenv';
import * as http from 'http';
import * as url from 'url';

dotenv.config();

const port = process.env.PORT || 3000;

const server: http.Server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    // parse the URL with querystring
    const parsedUrl = url.parse(req.url, true);
    const {pathname, query} = parsedUrl;
    const trimmedPath = pathname.replace(/^\/+|\/$/g, '');
    const method = req.method.toLowerCase();

    res.end('Hello world\n');

    // tslint:disable-next-line
    console.log(`
      pathname: ${trimmedPath},
      method: ${method},
      query: ${JSON.stringify(query)}
    `);
  }
);

server.listen(port, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port}`);
});
