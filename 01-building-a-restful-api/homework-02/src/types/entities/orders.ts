import {MenuItem} from './menu-items';
import {User} from './users';

interface OrderLineItem {
  itemId: MenuItem['id'];
  quantity: number;
  total: number;
}

enum OrderStatus {
  Paid = 'paid',
  Partial = 'partial',
  Unpaid = 'unpaid',
}

interface Order {
  id: string;
  lineItems: OrderLineItem[];
  paymentId?: string;
  status: OrderStatus;
  userId: User['id'];
}

export {Order, OrderLineItem, OrderStatus};
