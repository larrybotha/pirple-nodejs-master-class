import {debuglog} from 'util';

import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const debug = debuglog('sessions-view');

const viewData = {
  body: {className: 'sessions-create'},
  head: {
    description: 'Create session',
    title: 'Create session',
  },
};

const sessionCreateMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('sessions/create', viewData);

      cb(200, view, 'text/html');
    } catch (err) {
      debug(err);
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const create = createServiceRouter(
  allowedMethods,
  sessionCreateMethods,
  'text/html'
);

export {create};
