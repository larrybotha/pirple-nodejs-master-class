import {ResponseError} from '../../types/responses';
import {Validation} from '../../validations';
import {createErrorResponse} from './index';

type GetInvalidParamsResonse = (
  invalidParams: Validation[],
  pathname: string
) => ResponseError;
const getInvalidParamsResponse: GetInvalidParamsResonse = (
  invalidParams,
  pathname
) => {
  return createErrorResponse({
    errors: invalidParams,
    instance: pathname,
    status: 400,
    title: 'Invalid path params',
  });
};

export {getInvalidParamsResponse};
