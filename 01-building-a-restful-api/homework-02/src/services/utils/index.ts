import {ResponseError, ResponseSuccess} from '../../types/responses';
import {Service, ServiceMethod} from '../../types/services';

import {forbidden} from '../forbidden';

type CreateService = (
  allowedMethods: string[],
  service: Service
) => ServiceMethod;
const createService: CreateService = (allowedMethods, service) => (
  req,
  payload
) => {
  const method = req.method.toLowerCase();

  if (allowedMethods.indexOf(method) > -1) {
    const serviceMethod: ServiceMethod = service[method];

    return serviceMethod(req, payload);
  } else {
    return forbidden(req, payload);
  }
};

type CreateSuccessResponseParam = Pick<
  ResponseSuccess,
  Exclude<keyof ResponseSuccess, 'ok'>
>;

type CreateSuccessResponse = (
  options: CreateSuccessResponseParam
) => ResponseSuccess;
const createSuccessResponse: CreateSuccessResponse = options => {
  return {...options, ok: true};
};

type CreateErrorResponseParam = Pick<
  ResponseError,
  Exclude<keyof ResponseError, 'ok'>
>;
type CreateErrorResponse = (options: CreateErrorResponseParam) => ResponseError;
const createErrorResponse: CreateErrorResponse = options => {
  const type = options.type || 'about:blank';

  return {...options, ok: false, type};
};

export {createService, createSuccessResponse, createErrorResponse};
