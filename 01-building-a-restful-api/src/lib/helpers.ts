import * as crypto from 'crypto';

import config from '../config';

type Hash = (s: string) => string;
const hash: Hash = str => {
  if (typeof str === 'string') {
    const hashedString = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');

    return hashedString;
  } else {
    return '';
  }
};

// parse strings with try / catch because JSON.parse throws errors
type ParseJsonToObject = (s: string) => any;
const parseJsonToObject: ParseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return {};
  }
};

type CreateRandomString = (n: number) => string;
const createRandomString: CreateRandomString = (n = 0) => {
  if (n > 0) {
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    return Array(n)
      .fill(undefined)
      .map(() => {
        const randomChar = possibleChars.charAt(
          Math.floor(Math.random() * possibleChars.length)
        );

        return randomChar;
      })
      .join('');
  } else {
    return '';
  }
};

const helpers = {createRandomString, hash, parseJsonToObject};

export {createRandomString, hash, parseJsonToObject};

export default helpers;
