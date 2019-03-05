import {ResponseError} from '../types/responses';
import {ServiceMethod} from '../types/services';

import {createErrorResponse} from './utils';

const notFound: ServiceMethod = async ({pathname}) => {
  const response = createErrorResponse({
    instance: pathname,
    status: 404,
    title: 'Not found',
  });

  return response;
};

export {notFound};
