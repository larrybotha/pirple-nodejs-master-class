import {debuglog} from 'util';

import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const debug = debuglog('sessions-view');

const viewData = {
  body: {className: 'sessions-delete'},
  head: {
    description: 'delete session',
    title: 'delete session',
  },
};

const sessionDeleteMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('sessions/delete', viewData);

      cb(200, view, 'text/html');
    } catch (err) {
      debug(err);
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const deleteSession = createServiceRouter(
  allowedMethods,
  sessionDeleteMethods,
  'text/html'
);

export {deleteSession};
