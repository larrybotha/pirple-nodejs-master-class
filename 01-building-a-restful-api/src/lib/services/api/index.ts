import {checks} from './checks';
import {examples} from './examples';
import {tokens} from './tokens';
import {users} from './users';

const apiServices = {
  'api/checks/:id': checks,
  'api/tokens/:id': tokens,
  'api/users/:phone': users,

  'api/examples/error': examples,
};

export {apiServices};
