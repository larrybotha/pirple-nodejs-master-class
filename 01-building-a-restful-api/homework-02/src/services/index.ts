import {ResponseError, ResponseSuccess} from '../types/responses';
import {Service, ServiceMethod} from '../types/services';

import {ping} from './ping';

interface Services {
  [key: string]: ServiceMethod;
}
const services: Services = {
  ping,
};

export {services};
