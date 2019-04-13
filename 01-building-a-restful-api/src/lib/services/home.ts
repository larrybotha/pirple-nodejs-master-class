import {Handler} from '../types';

import {createServiceRouter} from './utils';

const homeMethods: {[key: string]: Handler} = {
  get: (_, cb) => {
    cb(200, 'hello', 'text/html');
  },
};

const allowedMethods = ['get'];
const home = createServiceRouter(allowedMethods, homeMethods);

export {home}
