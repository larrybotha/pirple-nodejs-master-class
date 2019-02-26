import * as http from 'http';

import {RequestData, RequestPayload} from './requests';
import {ResponseError, ResponseMetadata, ResponseSuccess} from './responses';

type ServiceMethod<Entity = null> = (
  req: RequestData,
  payload: RequestPayload
) => ResponseError | ResponseSuccess<Entity>;

interface Service {
  delete?: ServiceMethod;
  get?: ServiceMethod;
  patch?: ServiceMethod;
  post?: ServiceMethod;
  put?: ServiceMethod;
  [key: string]: ServiceMethod;
}

export {RequestData, ServiceMethod, Service};
