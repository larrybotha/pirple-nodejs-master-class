import {Handler} from '../../types';

import {createServiceRouter} from '../utils';

const examplesMethods: {[key: string]: Handler} = {
  get: () => {
    throw new Error('error');
  },
};

const allowedMethods = ['get'];
const examples = createServiceRouter(allowedMethods, examplesMethods);

export {examples};
