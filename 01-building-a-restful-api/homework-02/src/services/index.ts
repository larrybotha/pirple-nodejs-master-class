import {ResponseError, ResponseSuccess} from '../types/responses';
import {Service, ServiceMethod} from '../types/services';

import {menuItemsService as menuItems} from './menu-items';
import {orders} from './orders';
import {payments} from './payments';
import {ping} from './ping';
import {tokens} from './tokens';
import {users} from './users';

interface Services {
  [key: string]: ServiceMethod;
}
const services: Services = {
  'menu-items': menuItems,
  orders,
  payments,
  ping,
  tokens,
  users,
};

export {services};
