import {Handler} from './types';

// a ping handler purely for clients to evaluate whether the server is up or not
export const ping: Handler = (data, cb) => {
  cb(200);
};
