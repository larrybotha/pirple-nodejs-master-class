import {Handler} from './types';

type CreateServiceRouter = (
  allowedMethods: string[],
  serviceHandlers: {[key: string]: Handler}
) => Handler;

const createServiceRouter: CreateServiceRouter = (
  allowedMethods,
  serviceHandlers
) => (data, cb) => {
  const {method} = data;
  const serviceHandler: Handler | undefined = serviceHandlers[method];

  if (serviceHandler) {
    serviceHandler(data, cb);
  } else {
    cb(405);
  }
};

export {createServiceRouter};
