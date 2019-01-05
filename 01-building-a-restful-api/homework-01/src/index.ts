import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

import config from './config';

const {envName, httpPort, httpsPort} = config;

interface IncomingRequestData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload: any;
  query: object;
}

type RouteHandler = (
  data: IncomingRequestData
) => {
  statusCode: number;
  responsePayload?: object;
};

const router: {[key: string]: RouteHandler} = {
  hello: data => ({statusCode: 200, responsePayload: {body: 'hi!'}}),
  ping: data => ({statusCode: 200}),

  notFound: data => ({statusCode: 404}),
};

// create unified server
const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const {headers, method} = req;
  const {pathname, query} = url.parse(req.url, true);
  const trimmedPathname = pathname.replace(/^\/+|\/$/g, '');
  const routeHandler: RouteHandler = router[trimmedPathname] || router.notFound;
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', data => (buffer += decoder.write(data)));

  req.on('end', () => {
    buffer += decoder.end();

    const data: IncomingRequestData = {
      headers,
      method,
      pathname: trimmedPathname,
      payload: buffer,
      query,
    };
    const {responsePayload = {}, statusCode = 200} = routeHandler(data);

    res.setHeader('Content-type', 'application/json');
    res.writeHead(statusCode);
    res.end(JSON.stringify(responsePayload));

    // tslint:disable-next-line
    console.log('responded with: ', responsePayload);
  });
};

// create servers
const httpServer: http.Server = http.createServer(unifiedServer);

const httpsServerOptions: https.ServerOptions = {
  cert: fs.readFileSync(path.resolve(__dirname, '../../../https/cert.pem')),
  key: fs.readFileSync(path.resolve(__dirname, '../../../https/key.pem')),
};
const httpsServer: https.Server = https.createServer(
  httpsServerOptions,
  unifiedServer
);

const serverStartHandler: (port: number, env: string) => () => void = (
  port,
  env
) => () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port} on ${env}`);
};

// start servers
httpServer.listen(httpPort, serverStartHandler(httpPort, envName));
httpsServer.listen(httpsPort, serverStartHandler(httpsPort, envName));
