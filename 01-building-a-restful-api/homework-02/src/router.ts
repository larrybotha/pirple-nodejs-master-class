import * as http from 'http';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

import {safeJSONParse} from './helpers';
import {getServiceConfig, getServiceMethod} from './helpers/router';
import {serviceConfigs} from './services';
import {notFound} from './services/not-found';

type Router = (req: http.IncomingMessage, res: http.ServerResponse) => void;
const router: Router = (req, res) => {
  const {url: reqUrl, headers, method} = req;
  const {pathname, query} = url.parse(reqUrl, true);
  const trimmedPath = pathname.trim();
  const serviceConfig = getServiceConfig(serviceConfigs, trimmedPath);
  const serviceMethod = serviceConfig
    ? getServiceMethod(serviceConfig, method)
    : notFound;
  const decoder = new StringDecoder('utf8');
  let data = '';

  req.setEncoding('utf8');

  req.on('data', d => (data += decoder.write(d)));

  req.on('end', async () => {
    data += decoder.end();
    const requestPayload = safeJSONParse(data);
    const {payload, metadata} = await serviceMethod(
      {headers, method: method.toUpperCase(), pathname: trimmedPath, query},
      requestPayload
    );

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(metadata.status);

    res.end(payload ? JSON.stringify(payload) : null);
  });
};

export {router};
