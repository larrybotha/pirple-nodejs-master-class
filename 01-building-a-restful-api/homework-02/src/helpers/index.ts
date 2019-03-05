import * as crypto from 'crypto';

import {config} from '../config';

const safeJSONParse = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

type CreateHash = (str: string) => string;
const createHash = (str = '') => {
  if (str) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');

    return hash;
  } else {
    return '';
  }
};

type CreateRandomString = (length: number) => string;
const createRandomString: CreateRandomString = (length = 0) => {
  const chars = 'abcdefghijklmnopsqrstuvxyz';
  const charsLength = chars.length;
  const randString = Array.from({length})
    .map(() => {
      const randInt = Math.floor(Math.random() * charsLength);

      return chars[randInt];
    })
    .join('');

  return randString;
};

export {createHash, createRandomString, safeJSONParse};
