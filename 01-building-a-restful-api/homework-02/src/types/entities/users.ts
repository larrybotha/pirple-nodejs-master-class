import {StripeCustomer} from './stripe-customer';

interface User {
  address?: string;
  email: string;
  id: string;
  name?: string;
  password: string;
  stripeId: StripeCustomer['id'];
  stripeSourceIds: string[];
}

export {User};
