import {ServiceMethod} from '../types/services';

import {createErrorResponse} from './utils';

const forbidden: ServiceMethod = () => {
  const response = createErrorResponse(
    {
      status: 403,
      title: 'Method not allowed',
    },
    {status: 403}
  );

  return response;
};

export {forbidden};
