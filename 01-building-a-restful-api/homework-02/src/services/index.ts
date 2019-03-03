import {ResponseError, ResponseSuccess} from '../types/responses';
import {Service, ServiceMethod} from '../types/services';

import {ping} from './ping';
import {tokens} from './tokens';

interface Services {
  [key: string]: ServiceMethod;
}
const services: Services = {
  ping,
  tokens,
};

export {services};
