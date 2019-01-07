import * as crypto from 'crypto';

import config from '../config';

type Hash = (s: string) => string | boolean;
const hash: Hash = string => {
  if (typeof string === 'string') {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(string)
      .digest('hex');

    return hash;
  } else {
    return false;
  }
};

const helpers = {};

module.exports = helpers;
