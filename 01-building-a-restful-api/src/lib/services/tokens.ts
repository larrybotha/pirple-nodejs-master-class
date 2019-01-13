import dataLib from '../data';
import helpers from '../helpers';
import {Handler, RequestData} from './utils/types';
import {validatePassword, validatePhone} from './utils/validations';

interface TokenPostPayload {
  password: string;
  phone: string;
}

interface TokenMethods {
  delete: Handler;
  get: Handler;
  post: Handler<TokenPostPayload>;
  put: Handler;
  [key: string]: any;
}

const tokenMethods: {[key: string]: Handler} = {
  delete: async (data, cb) => {},

  get: async (data, cb) => {},

  post: async ({payload}, cb) => {
    const phone = validatePhone(payload.phone);
    const password = validatePhone(payload.password);

    if (phone && password) {
      try {
        const user: any = await dataLib.read('users', phone);

        const hashedPassword = helpers.hash(payload.password);

        if (!hashedPassword) {
          return cb(500, {error: `Couldn't hash user's password`});
        }

        if (user.password !== hashedPassword) {
          cb(400, {error: 'username or password incorrect'});
        }

        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 60;
        const token = {
          phone,
          id: tokenId,
          expires,
        };

        const tokenData = await dataLib.create('tokens', tokenId, token);

        cb(201, tokenData);
      } catch (err) {
        cb(500, err);
      }
    } else {
      cb(400, {error: 'Missing required params, phone or telephone'});
    }
  },

  put: async (data, cb) => {},
};

const tokens: Handler = (data, cb) => {
  const allowedMethods = ['as'];
  const {method} = data;

  if (allowedMethods.indexOf(method) > -1) {
    tokenMethods[method](data, cb);
  } else {
    cb(405);
  }
};

export {tokens};
