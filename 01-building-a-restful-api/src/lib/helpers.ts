import * as crypto from 'crypto';

import config from '../config';

type Hash = (s: string) => string | boolean;
const hash: Hash = str => {
  if (typeof str === 'string') {
    const hashedString = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');

    return hashedString;
  } else {
    return false;
  }
};

// parse strings with try / catch because JSON.parse throws errors
type ParseJsonToObject = (s: string) => object;
const parseJsonToObject: ParseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return {};
  }
};

type CreateRandomString = (n: number) => string;
const createRandomString: CreateRandomString = n => {
  return `${n}`;
};

const helpers = {createRandomString, hash, parseJsonToObject};

export default helpers;
