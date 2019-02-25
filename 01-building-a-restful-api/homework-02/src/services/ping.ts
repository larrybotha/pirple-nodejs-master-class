import {Service} from '../types/services';

import {createService, createSuccessResponse} from './utils';

const pingMethods: Service = {
  get: () => {
    const response = createSuccessResponse({status: 200});

    return response;
  },
};

const allowedMethods = ['get'];

const ping = createService(allowedMethods, pingMethods);

export {ping};
