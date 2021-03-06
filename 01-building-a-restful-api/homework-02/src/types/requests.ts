import * as http from 'http';

interface RequestData<Payload = any> {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: Payload;
  query?: object;
}

interface RequestPayload {
  [key: string]: any;
}

export {RequestData, RequestPayload};
