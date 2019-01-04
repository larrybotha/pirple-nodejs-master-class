/**
 * entry point for API
 */

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import {ParsedUrlQuery} from 'querystring';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

import config from './config';

const {httpPort, httpsPort, envName} = config;

interface RequestData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: string | object;
  query?: ParsedUrlQuery;
}

type HandlerCallback = (statusCode: number, responseData?: object) => void;
type Handler = (data: RequestData, cb: HandlerCallback) => void;

const router: {[key: string]: Handler} = {
  notFound: (data, cb) => {
    cb(404);
  },

  sample: (data, cb) => {
    cb(406, {name: 'sample handler'});
  },
};

const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url, true);
  const {headers} = req;
  const {pathname, query} = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/$/g, '');
  const method = req.method.toLowerCase();
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    // make sure to write any data coming through in the `end` event to our buffer
    buffer += decoder.end();

    const handler: Handler = router[trimmedPath] || router.notFound;

    const data = {
      headers,
      method,
      pathname: trimmedPath,
      payload: buffer,
      query,
    };

    handler(data, (statusCode = 200, responseData = {}) => {
      // indicate to clients that the response is json
      res.setHeader('Content-type', 'application/json');

      // set the status code for the request
      res.writeHead(statusCode);

      // return the responseData as a string
      res.end(JSON.stringify(responseData));

      // tslint:disable-next-line
      console.log('responded with', responseData);
    });
  });
};

const httpServer: http.Server = http.createServer(unifiedServer);

httpServer.listen(httpPort, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${httpPort} in ${envName} mode`);
});

const httpsServerOptions: https.ServerOptions = {
  cert: fs.readFileSync('./https/cert.pem'),
  key: fs.readFileSync('./https/key.pem'),
};
const httpsServer: https.Server = https.createServer(
  httpsServerOptions,
  unifiedServer
);

httpsServer.listen(httpsPort, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${httpsPort} in ${envName} mode`);
});
