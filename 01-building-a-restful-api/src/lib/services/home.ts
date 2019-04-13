import {Handler} from '../types';

import {createServiceRouter, getView} from './utils';

const homeMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('index');

      cb(200, view, 'text/html');
    } catch (err) {
      cb(500, 'Server error');
    }
  },
};

const allowedMethods = ['get'];
const home = createServiceRouter(allowedMethods, homeMethods, 'text/html');

export {home};
