import * as crypto from 'crypto';

const safeJSONParse = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

type CreateHash = (str: string) => string;
const createHash = (length = 10) => {};

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

export {safeJSONParse};
