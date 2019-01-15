import dataLib from '../data';
import helpers from '../helpers';
import {exists} from '../validate';
import {Handler, RequestData} from './utils/types';
import {createServiceRouter} from './utils/index';
import {validatePassword, validatePhone} from './utils/validations';

interface TokenPostPayload {
  password: string;
  phone: string;
}

interface TokenDeletePayload {
  id: string;
}
interface TokenGetPayload {
  id: string;
}

interface TokenMethods {
  delete: Handler<TokenDeletePayload>;
  get: Handler<TokenGetPayload>;
  post: Handler<TokenPostPayload>;
  put: Handler;
  [key: string]: any;
}

const tokenMethods: {[key: string]: Handler} = {
  /*
   * required: id
   * optional: none
   */
  delete: async ({pathname}, cb) => {
    const [, tokenId] = pathname.split('/');
    const id = [tokenId].map(exists('id is required')).find(Boolean);
    const invalidFields = [id].filter(
      field => Boolean(field) && Boolean(field.error)
    );

    if (!invalidFields.length) {
      try {
        const rawTokenData: string = await dataLib.read('tokens', id);

        await dataLib.delete('tokens', id);

        cb(200);
      } catch (e) {
        cb(200);
      }
    } else {
      cb(400, {errors: invalidFields});
    }
  },

  /*
   * required data: ud
   * optional data: none
   */
  get: async ({pathname}, cb) => {
    const [, tokenId] = pathname.split('/');
    const id = [tokenId].map(exists('id is required')).find(Boolean);
    const invalidFields = [id].filter(
      field => Boolean(field) && Boolean(field.error)
    );

    if (!invalidFields.length) {
      try {
        const rawTokenData: string = await dataLib.read('tokens', id);
        const tokenData = helpers.parseJsonToObject(rawTokenData);

        cb(200, tokenData);
      } catch (err) {
        cb(404, err);
      }
    } else {
      cb(400, {errors: invalidFields});
    }
  },

  /*
   * required data: phone, password
   * optional data: none
   */
  post: async ({payload}, cb) => {
    const phone = validatePhone(payload.phone);
    const password = validatePassword(payload.password);
    const fields = [phone, password];
    const invalidFields = fields.filter(
      field => Boolean(field) && Boolean(field.error)
    );
    const isValid = invalidFields.length === 0;

    if (isValid) {
      try {
        const rawUser: string = await dataLib.read('users', phone);
        const user: any = helpers.parseJsonToObject(rawUser);

        const hashedPassword = helpers.hash(payload.password);

        if (!hashedPassword) {
          return cb(500, {error: `Couldn't hash user's password`});
        }

        if (user.password !== hashedPassword) {
          return cb(400, {error: 'username or password incorrect'});
        }

        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 60;
        const token = {
          expires,
          id: tokenId,
          phone,
        };

        const tokenData = await dataLib.create('tokens', tokenId, token);

        cb(201, tokenData);
      } catch (err) {
        cb(404, err);
      }
    } else {
      cb(400, {error: invalidFields});
    }
  },

  /*
   * required: id
   * optional: none
   */
  put: async (data, cb) => {},
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const tokens = createServiceRouter(allowedMethods, tokenMethods);

export {tokens};
