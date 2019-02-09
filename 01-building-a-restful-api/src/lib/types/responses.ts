type HttpStatusCode = number;

interface ResponseError {
  detail: string;
  instance?: string;
  status: HttpStatusCode;
  title: string;
  type?: string;
  [key: string]: any;
}

interface ResponseSuccess {
  [key: string]: any;
}

export {ResponseError, ResponseSuccess};
