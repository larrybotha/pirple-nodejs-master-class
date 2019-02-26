import {Service} from '../types/services';

import {createService} from './utils';

const pingMethods: Service = {
  get: () => {
    return {metadata: {status: 200}};
  },
};

const allowedMethods = ['get'];

const ping = createService(allowedMethods, pingMethods);

export {ping};
