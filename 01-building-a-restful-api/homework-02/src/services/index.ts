import {ServiceConfig} from '../types/services';

import {menuItemsConfig} from './menu-items';
import {orderPaymentsConfig} from './order-payments';
import {ordersConfig} from './orders';
import {pingConfig} from './ping';
import {tokensConfig} from './tokens';
import {usersConfig} from './users';

const serviceConfigs: ServiceConfig[] = [
  menuItemsConfig,
  orderPaymentsConfig,
  ordersConfig,
  pingConfig,
  tokensConfig,
  usersConfig,
];

export {serviceConfigs};
