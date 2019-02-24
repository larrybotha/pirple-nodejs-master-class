import * as http from 'http';

interface Response {
  ok: boolean;
  status: number;
}

interface ResponseSuccess extends Response {
  result: {
    offset?: number;
    total?: number;
    [key: string]: any;
  };
}
interface ResponseError extends Response {
  type?: string;
  title: string;
  detail?: string;
  // pathname, essentially
  instance?: string;
  errors?: any[];
}

export {ResponseSuccess, ResponseError};
