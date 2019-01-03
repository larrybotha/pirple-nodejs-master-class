import * as dotenv from 'dotenv';
import * as http from 'http';
import {ParsedUrlQuery} from 'querystring';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

dotenv.config();

const port = process.env.PORT || 3000;

interface ResponseData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: string | object;
  query?: ParsedUrlQuery;
}

type HandlerCallback = (statusCode: number, payload?: object) => void;
type Handler = (data: ResponseData, cb: HandlerCallback) => void;

const router: {[key: string]: Handler} = {
  notFound: (data, cb) => {
    cb(404);
  },
  sample: (data, cb) => {
    cb(406, {name: 'sample handler'});
  },
};

const server: http.Server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
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

      handler(data, (statusCode = 200, payload = JSON.parse(buffer)) => {
        const code = statusCode;

        // set the status code for the request
        res.writeHead(code);
        // return the payload as a string
        res.end(JSON.stringify(payload));

        // tslint:disable-next-line
        console.log('responded with', payload);
      });
    });
  }
);

server.listen(port, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port}`);
});
