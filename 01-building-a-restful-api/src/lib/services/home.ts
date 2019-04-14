import {Handler} from '../types';

import {createServiceRouter, getView, interpolateViewVars} from './utils';

const viewData = {
  body: {
    className: 'home',
  },
  head: {
    description: 'home page',
    title: 'home',
  },
};

const homeMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('index');

      cb(200, interpolateViewVars(view, viewData), 'text/html');
    } catch (err) {
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const home = createServiceRouter(allowedMethods, homeMethods, 'text/html');

export {home};
