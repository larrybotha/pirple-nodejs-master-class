import services from './services';
import {Handler} from './types';

const router: {[key: string]: Handler} = {
  ...services,
};

export default router;
