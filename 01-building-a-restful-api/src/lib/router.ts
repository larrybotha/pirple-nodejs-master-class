import {Handler, notFound, ping} from './route-handlers';

const router: {[key: string]: Handler} = {
  notFound,
  ping,
};

export default router;
