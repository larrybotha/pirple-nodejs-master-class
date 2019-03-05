import {Service, ServiceMethod} from '../types/services';

import {createService} from './utils';

const pingMethods: Service<string> = {
  get: async () => {
    return {metadata: {status: 200}, payload: 'ok'};
  },
};

const allowedMethods = ['get'];

const ping: ServiceMethod<string> = createService(allowedMethods, pingMethods);

export {ping};
