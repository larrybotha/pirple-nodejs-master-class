import {debuglog} from 'util';

import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const debug = debuglog('accounts-view');

const viewData = {
  body: {className: 'account-edit'},
  head: {
    description: 'Edit account',
    title: 'Edit',
  },
};

const accountEditMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('accounts/edit', viewData);

      cb(200, view, 'text/html');
    } catch (err) {
      debug(err);
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const edit = createServiceRouter(
  allowedMethods,
  accountEditMethods,
  'text/html'
);

export {edit};
