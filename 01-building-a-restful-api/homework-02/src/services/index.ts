import {ResponseError, ResponseSuccess} from '../types/responses';
import {Service, ServiceMethod} from '../types/services';

import {ping} from './ping';
import {tokens} from './tokens';
import {users} from './users';

interface Services {
  [key: string]: ServiceMethod;
}
const services: Services = {
  ping,
  tokens,
  users,
};

export {services};
