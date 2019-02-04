/**
 * entry point for API
 */

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

import config from '../config';
import helpers from './helpers';
import router from './router';
import {Handler, RequestData} from './services/utils/types';

const {httpPort, httpsPort, envName} = config;

const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url, true);
  const {headers} = req;
  const {pathname, query} = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/$/g, '');
  const method = req.method.toLowerCase();
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    // make sure to write any data coming through in the `end` event to our buffer
    buffer += decoder.end();

    const handler: Handler =
      router[trimmedPath.split('/').find(Boolean)] || router.notFound;

    const data = {
      headers,
      method,
      pathname: trimmedPath,
      payload: helpers.parseJsonToObject(buffer),
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

const init = () => {
  const httpServer: http.Server = http.createServer(unifiedServer);

  httpServer.listen(httpPort, () => {
    // tslint:disable-next-line
    console.log(`server started at localhost:${httpPort} in ${envName} mode`);
  });

  const httpsServerOptions: https.ServerOptions = {
    cert: fs.readFileSync(path.join(__dirname, '../../../https/cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '../../../https/key.pem')),
  };
  const httpsServer: https.Server = https.createServer(
    httpsServerOptions,
    unifiedServer
  );

  httpsServer.listen(httpsPort, () => {
    // tslint:disable-next-line
    console.log(`server started at localhost:${httpsPort} in ${envName} mode`);
  });
};

const server = {init};

export default server;
