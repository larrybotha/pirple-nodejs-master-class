import services from './services';
import {Handler} from './services/utils/types';

const router: {[key: string]: Handler} = {
  ...services,
};

export default router;
