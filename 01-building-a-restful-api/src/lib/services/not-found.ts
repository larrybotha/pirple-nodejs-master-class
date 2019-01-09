import {Handler} from './types';

const notFound: Handler = (data, cb) => {
  cb(404);
};

export {notFound};
