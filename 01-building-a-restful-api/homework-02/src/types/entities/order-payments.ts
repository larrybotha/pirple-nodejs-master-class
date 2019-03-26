import {Order} from './orders';
import {User} from './users';

interface PaymentEntity {
  date: number;
  amount: number;
}

enum OrderPaymentStatus {
  Paid = 'paid',
  Partial = 'partial',
  Unpaid = 'unpaid',
}

interface OrderPayment {
  entities: PaymentEntity[];
  orderId: Order['id'];
  status: OrderPaymentStatus;
  userId: User['id'];
}

export {OrderPayment, OrderPaymentStatus};
