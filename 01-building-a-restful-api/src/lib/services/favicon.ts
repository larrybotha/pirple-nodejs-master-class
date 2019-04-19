import {Handler} from '../types';

import {createServiceRouter} from './utils';

const faviconMethods: {[key: string]: Handler} = {
  get: (_, cb) => {
    cb(200, {}, 'image/x-icon');
  },
};

const allowedMethods = ['get'];
const faviconService = createServiceRouter(allowedMethods, faviconMethods);

export {faviconService};
