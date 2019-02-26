import * as http from 'http';

interface ResponseMetadata {
  status: number;
  headers?: {
    [key: string]: string;
  };
}

type ResponseDataSuccess<Entity = null> = Entity | Entity[];
interface ResponseDataError {
  detail?: string;
  errors?: any[];
  // pathname, essentially
  instance?: string;
  status: number;
  title: string;
  type?: string;
}

interface Response {
  metadata: ResponseMetadata;
}

interface ResponseError extends Response {
  payload: ResponseDataError;
}

interface ResponseSuccess<Entity = null> extends Response {
  payload?: ResponseDataSuccess<Entity>;
}

export {
  ResponseDataError,
  ResponseDataSuccess,
  ResponseMetadata,
  ResponseSuccess,
  ResponseError,
};
