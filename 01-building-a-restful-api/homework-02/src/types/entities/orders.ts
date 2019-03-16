import {MenuItem} from './menu-items';
import {User} from './users';

interface OrderLineItem {
  itemId: MenuItem['id'];
  quantity: number;
}

enum OrderStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
}

interface Order {
  id: string;
  lineItems: OrderLineItem[];
  userId: User['id'];
  status: OrderStatus;
}

export {Order, OrderLineItem, OrderStatus};
