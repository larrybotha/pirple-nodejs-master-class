import * as http from 'http';
import {ParsedUrlQuery} from 'querystring';

import {ResponseError, ResponseSuccess} from './responses';

interface RequestData<T> {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: T;
  query?: ParsedUrlQuery;
}

type HandlerCallback = (
  statusCode: number,
  responseData?: ResponseSuccess | ResponseError
) => void;
type Handler<T = any> = (data: RequestData<T>, cb: HandlerCallback) => void;

export {RequestData, Handler};
