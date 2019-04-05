import {Handler} from '../types';

import {createServiceRouter} from './utils';

interface PingMethods {
  get: Handler;
}

const pingMethods: {[key: string]: Handler} = {
  get: (_, cb) => {
    cb(200, {status: 'running'});
  },
};

const allowedMethods = ['get'];
const ping = createServiceRouter(allowedMethods, pingMethods);

export {ping};
