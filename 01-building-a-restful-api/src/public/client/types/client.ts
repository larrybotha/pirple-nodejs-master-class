import {Config} from './config';

interface Header {
  name: string;
  value: string;
}

interface RequestOptions {
  sessionToken?: Config['sessionToken'];
  callback?: () => void;
  headers?: Header[];
  method: string;
  path: string;
  payload?: any;
  queryStringObject?: {[key: string]: string};
}

export {RequestOptions};
