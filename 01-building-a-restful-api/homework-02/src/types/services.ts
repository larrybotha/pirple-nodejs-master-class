import * as http from 'http';

import {RequestData, RequestPayload} from './requests';
import {ResponseError, ResponseSuccess} from './responses';

type ServiceMethod = (
  req: RequestData,
  payload: RequestPayload
) => ResponseSuccess | ResponseError;

interface Service {
  delete?: ServiceMethod;
  get?: ServiceMethod;
  patch?: ServiceMethod;
  post?: ServiceMethod;
  put?: ServiceMethod;
  [key: string]: ServiceMethod;
}

export {RequestData, ServiceMethod, Service};
