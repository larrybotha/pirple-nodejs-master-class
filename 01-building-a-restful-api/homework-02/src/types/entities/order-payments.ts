import {User} from './users';
import {Order} from './orders';

interface PaymentEntity {
  date: Date;
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
