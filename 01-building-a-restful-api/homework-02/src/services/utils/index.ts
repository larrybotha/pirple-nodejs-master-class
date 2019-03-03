import {
  ResponseDataError,
  ResponseError,
  ResponseMetadata,
} from '../../types/responses';
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

type CreateErrorResponse = (
  payload: ResponseDataError,
  metadata?: ResponseMetadata
) => ResponseError;
const createErrorResponse: CreateErrorResponse = (
  payload,
  metadata = {status: payload.status}
) => {
  const type = payload.type || 'about:blank';

  return {payload: {...payload, type}, metadata};
};

export {createService, createErrorResponse};
