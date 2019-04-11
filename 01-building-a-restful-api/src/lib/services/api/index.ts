import {checks} from './checks';
import {tokens} from './tokens';
import {users} from './users';

const apiServices = {
  'api/checks/:id': checks,
  'api/tokens/:id': tokens,
  'api/users/:phone': users,
};

export {apiServices};
