import * as http from 'http';
import * as url from 'url';
import {StringDecoder} from 'string_decoder';

import {safeJSONParse} from './helpers';
import {services} from './services';
import {notFound} from './services/not-found';

type Router = (req: http.IncomingMessage, res: http.ServerResponse) => void;
const router: Router = (req, res) => {
  const {url: reqUrl, headers, method} = req;
  const {pathname, query} = url.parse(reqUrl, true);
  const trimmedPath = pathname.trim();
  const serviceName = trimmedPath.split('/').find(Boolean);
  const service = services[serviceName] || notFound;
  const decoder = new StringDecoder('utf8');
  let data = '';

  req.setEncoding('utf8');

  req.on('data', d => {
    data += decoder.write(d);
  });

  req.on('end', () => {
    data += decoder.end();
    const requestPayload = safeJSONParse(data);
    const {payload, metadata} = service(
      {headers, method: method.toUpperCase(), pathname: trimmedPath, query},
      requestPayload
    );

    res.setHeader('Content-type', 'application/json');
    res.writeHead(metadata.status);
    res.end(payload ? JSON.stringify(payload) : null);
  });
};

export {router};
