import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const viewData = {
  body: {className: 'checks'},
  head: {
    description: `Dolor fugit itaque aspernatur placeat illo hic id Nulla cum at accusamus nesciunt temporibus quisquam Nulla similique laudantium quidem iure facere? Quibusdam cumque a nisi doloribus dolorem. Accusantium excepturi commodi.`,
    title: 'checks list',
  },
};

const checksMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('checks/index', viewData);

      cb(200, view, 'text/html');
    } catch (err) {
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const checksList = createServiceRouter(
  allowedMethods,
  checksMethods,
  'text/html'
);

export {checksList};
