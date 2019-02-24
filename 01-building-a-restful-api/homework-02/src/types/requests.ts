import * as http from 'http';

interface RequestData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: any;
}

export {RequestData};
