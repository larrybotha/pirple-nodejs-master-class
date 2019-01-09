import * as http from 'http';
import {ParsedUrlQuery} from 'querystring';

export interface RequestData<T> {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: T;
  query?: ParsedUrlQuery;
}

type HandlerCallback = (statusCode: number, responseData?: object) => void;
export type Handler<T = any> = (
  data: RequestData<T>,
  cb: HandlerCallback
) => void;
