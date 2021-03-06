/**
 * entry point for API
 */

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';
import {debuglog} from 'util';

import config from '../config';
import helpers from './helpers';
import router from './router';
import {Handler, RequestData} from './types';

const debug = debuglog('server');
const {httpPort, httpsPort, envName} = config;

const getDefaultResponseData = (contentType: string): object | string => {
  return /json/.test(contentType) ? {} : '';
};

const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url, true);
  const {headers} = req;
  const {pathname, query} = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/$/g, '');
  const method = req.method.toLowerCase();
  const serviceName = Object.keys(router).find(name => {
    const serviceParts = name.split('/');
    const pathParts = trimmedPath.split('/');

    return (
      (trimmedPath === '' && name === 'home') ||
      serviceParts.every((part, i) => /^:/.test(part) || part === pathParts[i])
    );
  });
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', async () => {
    // make sure to write any data coming through in the `end` event to our buffer
    buffer += decoder.end();

    const handler: Handler = router[serviceName] || router.notFound;

    const data = {
      headers,
      method,
      pathname: trimmedPath,
      payload: helpers.parseJsonToObject(buffer),
      query,
    };

    try {
      await handler(
        data,
        (statusCode = 200, responseData, contentType = 'application/json') => {
          const response = responseData || getDefaultResponseData(contentType);

          // indicate to clients that the response is json
          res.setHeader('Content-type', contentType);

          // set the status code for the request
          res.writeHead(statusCode);

          // return the responseData as a string
          res.end(
            typeof response === 'string' || /image/.test(contentType)
              ? response
              : JSON.stringify(response)
          );

          const logColour = /^2/.test(`${statusCode}`)
            ? '\x1b[32m%s\x1b[0m'
            : '\x1b[31m%s\x1b[0m';

          debug(
            logColour,
            `${method.toUpperCase()}/${trimmedPath} ${statusCode}`
          );
        }
      );
    } catch (err) {
      res.writeHead(500);

      res.end(JSON.stringify(err));
    }
  });
};

const init = () => {
  const httpServer: http.Server = http.createServer(unifiedServer);

  httpServer.listen(httpPort, () => {
    // tslint:disable-next-line
    console.log(
      '\x1b[36m%s\x1b[0m',
      `server started at localhost:${httpPort} in ${envName} mode`
    );
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
    console.log(
      '\x1b[35m%s\x1b[0m',
      `server started at localhost:${httpsPort} in ${envName} mode`
    );
  });
};

const server = {init};

export default server;
