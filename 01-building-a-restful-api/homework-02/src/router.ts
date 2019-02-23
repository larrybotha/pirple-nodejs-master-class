import * as http from 'http';
import * as url from 'url';

import {services} from './services';

type Router = (req: http.IncomingMessage, res: http.ServerResponse) => void;
const router: Router = (req, res) => {
  const {url: reqUrl, headers, method} = req;
  const {pathname, query} = url.parse(reqUrl, true);
  const serviceName = pathname.split('/').find(Boolean);
  const service = services[serviceName];

  res.setHeader('Content-type', 'application/json');

  if (service) {
    service({headers, method, pathname, query});
  } else {
    services.notFound();
  }
};

export {router};
