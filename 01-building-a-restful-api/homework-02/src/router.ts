import * as http from 'http';
import * as url from 'url';

import {services} from './services';
import {notFound} from './services/not-found';
import {safeStringify} from './helpers';

type Router = (req: http.IncomingMessage, res: http.ServerResponse) => void;
const router: Router = (req, res) => {
  const {url: reqUrl, headers, method} = req;
  const {pathname, query} = url.parse(reqUrl, true);
  const serviceName = pathname.split('/').find(Boolean);
  const service = services[serviceName] || notFound;
  let data: string;

  req.setEncoding('utf8');

  req.on('data', d => {
    data = data + d;
  });

  req.on('end', () => {
    const requestPayload = data ? JSON.parse(data) : null;
    const {payload, metadata} = service(
      {headers, method: method.toUpperCase(), pathname, query},
      requestPayload
    );

    res.setHeader('Content-type', 'application/json');
    res.writeHead(metadata.status);
    res.end(payload ? safeStringify(payload) : null);
  });
};

export {router};
