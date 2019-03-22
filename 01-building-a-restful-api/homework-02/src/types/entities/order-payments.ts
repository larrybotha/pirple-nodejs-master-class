import {User} from './users';
import {Order} from './orders';

interface PaymentEntity {
  date: Date;
  amount: number;
}

interface OrderPayment {
  userId: User['id'];
  orderId: Order['id'];
  entities: PaymentEntity[];
}

export {OrderPayment};
