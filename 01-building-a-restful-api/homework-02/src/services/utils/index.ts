import {Service} from '../../types/services';
import {ResponseSuccess, ResponseError} from '../../types/responses';

type CreateService = (
  allowedMethods: string[],
  serviceMethods: Service
) => void;
const createService: CreateService = (allowedMethods, serviceMethods) => {};

type CreateSuccessResponseParam = Exclude<ResponseSuccess, 'ok'>;
type CreateSuccessResponse = (
  options: CreateSuccessResponseParam
) => ResponseSuccess;
const createSuccessResponse: CreateSuccessResponse = options => {
  return {
    ...options,
    ok: true,
  };
};

type CreateErrorResponseParam = Exclude<ResponseError, 'ok'>;
type CreateErrorResponse = (options: CreateErrorResponseParam) => ResponseError;
const createErrorResponse: CreateErrorResponse = options => {
  const type = options.type || 'about:blank';

  return {
    ...options,
    type,
    ok: false,
  };
};

export {createService, createSuccessResponse, createErrorResponse};
