import services from './services';
import {Handler} from './services/types';

const router: {[key: string]: Handler} = {
  ...services,
};

export default router;
