import {Handler} from './utils/types';

const notFound: Handler = (data, cb) => {
  cb(404);
};

export {notFound};
