import {
  ResponseDataError,
  ResponseError,
  ResponseMetadata,
} from '../../types/responses';

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

export {createErrorResponse};
