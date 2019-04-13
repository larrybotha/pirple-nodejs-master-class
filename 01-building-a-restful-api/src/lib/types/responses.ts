type HttpStatusCode = number;

interface ResponseError {
  detail: string;
  instance?: string;
  status: HttpStatusCode;
  title: string;
  type?: string;
  [key: string]: any;
}

type ResponseSuccess = {[key: string]: any} | string;

export {ResponseError, ResponseSuccess};
