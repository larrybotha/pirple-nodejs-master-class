import {debuglog} from 'util';

import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const debug = debuglog('accounts-view');

const viewData = {
  body: {className: 'account-create'},
  head: {
    description: 'Create account',
    title: 'Create',
  },
};

const accountCreateMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('accounts/create', viewData);

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
  accountCreateMethods,
  'text/html'
);

export {create};
