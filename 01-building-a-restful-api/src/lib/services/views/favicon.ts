import {Handler} from '../../types';

import {createServiceRouter, getStaticAsset} from '../utils';

const faviconMethods: {[key: string]: Handler} = {
  get: async (_, cb) => {
    try {
      const favicon = await getStaticAsset('public/favicon.ico');

      cb(200, favicon, 'image/x-icon');
    } catch (err) {
      cb(500, err);
    }
  },
};

const allowedMethods = ['get'];
const faviconService = createServiceRouter(allowedMethods, faviconMethods);

export {faviconService};
