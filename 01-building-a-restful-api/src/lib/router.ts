import {Handler, notFound, ping, users} from './route-handlers';

const router: {[key: string]: Handler} = {
  notFound,
  ping,
  users,
};

export default router;
