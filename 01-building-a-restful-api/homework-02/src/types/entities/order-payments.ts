import {Order} from './orders';
import {User} from './users';

interface PaymentEntity {
  date: number;
  amount: number;
}

interface OrderPayment {
  entities: PaymentEntity[];
  orderId: Order['id'];
  userId: User['id'];
}

export {OrderPayment};
