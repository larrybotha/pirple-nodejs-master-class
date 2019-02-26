import * as http from 'http';

import {RequestData, RequestPayload} from './requests';
import {ResponseError, ResponseMetadata, ResponseSuccess} from './responses';

type ServiceMethod<Entity = any> = (
  req: RequestData,
  payload: RequestPayload
) => ResponseError | ResponseSuccess<Entity>;

interface Service<Entity = any> {
  delete?: ServiceMethod<Entity>;
  get?: ServiceMethod<Entity>;
  patch?: ServiceMethod<Entity>;
  post?: ServiceMethod<Entity>;
  put?: ServiceMethod<Entity>;
  [key: string]: ServiceMethod<Entity>;
}

export {RequestData, ServiceMethod, Service};
