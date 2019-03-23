import {Service, ServiceConfig, ServiceMethod} from '../types/services';

const pingService: Service<string> = {
  get: async () => {
    return {metadata: {status: 200}, payload: 'ok'};
  },
};

const pingConfig: ServiceConfig = {
  allowedMethods: ['get'],
  name: 'ping',
  path: 'ping',
  service: pingService,
};

export {pingConfig};
