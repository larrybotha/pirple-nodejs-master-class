import {ResponseError, ResponseSuccess} from '../types/responses';
import {Service, ServiceMethod} from '../types/services';

import {menuItemsService as menuItems} from './menu-items';
import {orders} from './orders';
import {ping} from './ping';
import {tokens} from './tokens';
import {users} from './users';

interface Services {
  [key: string]: ServiceMethod;
}
const services: Services = {
  'menu-items': menuItems,
  orders,
  ping,
  tokens,
  users,
};

export {services};
