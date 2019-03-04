import * as http from 'http';
import * as url from 'url';
import {StringDecoder} from 'string_decoder';

import {safeStringify} from './helpers';
import {services} from './services';
import {notFound} from './services/not-found';

type Router = (req: http.IncomingMessage, res: http.ServerResponse) => void;
const router: Router = (req, res) => {
  const {url: reqUrl, headers, method} = req;
  const {pathname, query} = url.parse(reqUrl, true);
  const serviceName = pathname.split('/').find(Boolean);
  const service = services[serviceName] || notFound;
  let data: string;
  const decoder = new StringDecoder('utf8');
  let data = '';

  req.setEncoding('utf8');

  req.on('data', d => {
    data += decoder.write(d);
  });

  req.on('end', () => {
    data += decoder.end();
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
