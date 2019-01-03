import * as dotenv from 'dotenv';
import * as http from 'http';
import {ParsedUrlQuery} from 'querystring';
import {StringDecoder} from 'string_decoder';
import * as url from 'url';

dotenv.config();

const port = process.env.PORT || 3000;

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
  }
);

server.listen(port, () => {
  // tslint:disable-next-line
  console.log(`server started at localhost:${port}`);
});
