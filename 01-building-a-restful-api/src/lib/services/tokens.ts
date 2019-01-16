import dataLib from '../data';
import helpers from '../helpers';
import {equals, exists} from '../validate';
import {createServiceRouter} from './utils/index';
import {Handler, RequestData} from './utils/types';
import {validatePassword, validatePhone} from './utils/validations';

interface TokenPostPayload {
  password: string;
  phone: string;
}

interface TokenPutPayload {
  extend: boolean;
}

interface TokenMethods {
  delete: Handler;
  get: Handler;
  post: Handler<TokenPostPayload>;
  put: Handler<TokenPutPayload>;
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
        const tokenData = await dataLib.read('tokens', id);

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
        const user = await dataLib.read('users', phone);

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
   * required: id, extend
   * optional: none
   *
   * We don't want users to define the time that they can extend the expiration of a
   * token, but we do want to extend it, so 'extend' is the only data that PUt expects
   */
  put: async ({pathname, payload}, cb) => {
    const [_, tokenId] = pathname.split('/');
    const extend = [payload.extend]
      .map(exists('extend is required'))
      .map(equals('extend must be true', {value: 'true'}))
      .find(Boolean);
    console.log(extend);

    if (tokenId && !extend.error) {
      try {
        const tokenData: {expires: number} = await dataLib.read(
          'tokens',
          tokenId
        );

        if (tokenData.expires > Date.now()) {
          const newTokenData = {
            ...tokenData,
            expires: Date.now() + 1000 * 60 * 60,
          };

          try {
            const newData = await dataLib.update(
              'tokens',
              tokenId,
              newTokenData
            );

            cb(200, newData);
          } catch (err) {
            cb(500, err);
          }
        } else {
          cb(400, {errors: [`Token expired and can't be renewed`]});
        }
      } catch (err) {
        cb(404, err);
      }
    } else {
      cb(400, {
        errors: [
          !tokenId ? {error: 'tokenId is required'} : null,
          extend,
        ].filter(Boolean),
      });
    }
  },
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const tokens = createServiceRouter(allowedMethods, tokenMethods);

export {tokens};
