import * as http from 'http';

interface RequestData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: any;
  query?: object;
}

interface RequestPayload {
  [key: string]: any;
}

export {RequestData, RequestPayload};
