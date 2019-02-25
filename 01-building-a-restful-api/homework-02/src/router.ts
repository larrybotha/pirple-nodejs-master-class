import * as http from 'http';
import * as url from 'url';

import {services} from './services';
import {notFound} from './services/not-found';

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
    const payload = data ? JSON.parse(data) : null;
    const responseData = service(
      {headers, method: method.toUpperCase(), pathname, query},
      payload
    );

    res.setHeader('Content-type', 'application/json');
    res.writeHead(responseData.status);
    res.end(JSON.stringify(responseData));
  });
};

export {router};
