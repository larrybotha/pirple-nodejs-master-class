import {checks} from './checks';
import {notFound} from './not-found';
import {ping} from './ping';
import {tokens} from './tokens';
import {users} from './users';

const services = {
  'api/checks/:id': checks,
  'api/tokens/:id': tokens,
  'api/users/:phone': users,
  notFound,
  ping,
};

export default services;
