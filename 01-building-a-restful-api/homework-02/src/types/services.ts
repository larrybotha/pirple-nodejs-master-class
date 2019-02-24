import * as http from 'http';

import {RequestData} from './requests';
import {ResponseSuccess, ResponseError} from './responses';

type ServiceMethod = (req: RequestData) => ResponseSuccess | ResponseError;

interface Service {
  delete?: ServiceMethod;
  get?: ServiceMethod;
  patch?: ServiceMethod;
  post?: ServiceMethod;
  put?: ServiceMethod;
}

export {RequestData, ServiceMethod, Service};
