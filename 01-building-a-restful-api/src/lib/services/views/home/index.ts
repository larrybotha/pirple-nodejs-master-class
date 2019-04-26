import {Handler} from '../../../types';

import {createServiceRouter, getView} from '../../utils';

const viewData = {
  body: {className: 'home'},
  head: {
    description: `Dolor fugit itaque aspernatur placeat illo hic id Nulla cum at accusamus nesciunt temporibus quisquam Nulla similique laudantium quidem iure facere? Quibusdam cumque a nisi doloribus dolorem. Accusantium excepturi commodi.`,
    title: 'Uptime Monitoring - Made Simple',
  },
};

const homeMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const view = await getView('index', viewData);

      cb(200, view, 'text/html');
    } catch (err) {
      cb(500, err.message);
    }
  },
};

const allowedMethods = ['get'];
const home = createServiceRouter(allowedMethods, homeMethods, 'text/html');

export {home};
