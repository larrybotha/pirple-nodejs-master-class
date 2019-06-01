import {performance, PerformanceObserver} from 'perf_hooks';
import {debuglog} from 'util';

import dataLib from '../../data';
import helpers from '../../helpers';
import {Handler} from '../../types';
import {Token} from '../../types/services/tokens';
import {User} from '../../types/services/users';
import {equals, exists} from '../../validations';

import {createServiceRouter} from '../utils';
import {verifyToken} from '../utils/verify-token';
import {validatePassword, validatePhone} from '../validations/users';

interface TokenPostPayload {
  password: string;
  phone: Token['phone'];
}

interface TokenPutPayload {
  extend: boolean;
  phone: Token['phone'];
}

interface TokenDeletePayload {
  phone: Token['phone'];
}

interface TokenMethods {
  delete: Handler<TokenDeletePayload>;
  get: Handler;
  post: Handler<TokenPostPayload>;
  put: Handler<TokenPutPayload>;
  [key: string]: any;
}

const debug = debuglog('performance');
const observer = new PerformanceObserver((items, obs) => {
  const entries = items.getEntriesByType('measure');

  entries.map(entry => {
    debug('\x1b[36m%s\x1b[0m', `${entry.name} ${entry.duration}`);
  });
});
observer.observe({entryTypes: ['measure']});

enum PerformanceMarks {
  START_INPUT_VALIDATON = 'start input validation',
  END_INPUT_VALIDATION = 'end input validation',
  START_CREATE_TOKEN = 'start create token',
  END_CREATE_TOKEN = 'end create token',
  START_USER_LOOKUP = 'start user lookup',
  END_USER_LOOKUP = 'end user lookup',
  START_HASH_PASSWORD = 'start hash password',
  END_HASH_PASSWORD = 'end hash password',
  START_TOKEN_STORAGE = 'start token storage',
  END_TOKEN_STORAGE = 'end token storage',
}

enum PerformanceMeasures {
  START_TO_END = 'start to end',
  VALIDATING_INPUT = 'validating input',
  USER_LOOKUP = 'user lookup',
  PASSWORD_HASHING = 'password hashing',
  TOKEN_CREATION = 'token data creation',
  TOKEN_STORAGE = 'token storage',
}

const performanceMap: {[key: string]: string[]} = {
  [PerformanceMeasures.START_TO_END]: [
    PerformanceMarks.START_INPUT_VALIDATON,
    PerformanceMarks.END_TOKEN_STORAGE,
  ],
  [PerformanceMeasures.VALIDATING_INPUT]: [
    PerformanceMarks.START_INPUT_VALIDATON,
    PerformanceMarks.END_INPUT_VALIDATION,
  ],
  [PerformanceMeasures.USER_LOOKUP]: [
    PerformanceMarks.START_USER_LOOKUP,
    PerformanceMarks.END_USER_LOOKUP,
  ],
  [PerformanceMeasures.PASSWORD_HASHING]: [
    PerformanceMarks.START_HASH_PASSWORD,
    PerformanceMarks.END_HASH_PASSWORD,
  ],
  [PerformanceMeasures.TOKEN_CREATION]: [
    PerformanceMarks.START_CREATE_TOKEN,
    PerformanceMarks.END_CREATE_TOKEN,
  ],
  [PerformanceMeasures.TOKEN_STORAGE]: [
    PerformanceMarks.START_TOKEN_STORAGE,
    PerformanceMarks.END_TOKEN_STORAGE,
  ],
};

const getTokenIdFromPath = (path: string): string => {
  const parts = path.split('/');

  return parts.length === 3 ? parts.slice(-1).find(Boolean) : '';
};

const tokenMethods: TokenMethods = {
  /*
   * required: id
   * optional: none
   *
   * only authenticated users may delete a token
   */
  delete: async ({headers, pathname}, cb) => {
    const {verified, msg, code} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const tokenId = getTokenIdFromPath(pathname);
    const id = [tokenId].map(exists('id is required')).find(Boolean);
    const invalidFields = [id].filter(
      field => Boolean(field) && Boolean(field.error)
    );

    if (!invalidFields.length) {
      try {
        await dataLib.read('tokens', id);
        await dataLib.delete('tokens', id);

        cb(200);
      } catch (e) {
        cb(204);
      }
    } else {
      cb(400, {errors: invalidFields});
    }
  },

  /*
   * required data: id, phone
   * optional data: none
   *
   * only authenticated users may get a token
   */
  get: async ({headers, pathname}, cb) => {
    const {verified, msg, code} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const token = getTokenIdFromPath(pathname);

    if (!token) {
      return cb(400, {error: 'missing required token parameter'});
    }

    if (token !== headers.token) {
      return cb(403, {error: 'You do not have access to this resource'});
    }

    try {
      const tokenData: Token = await dataLib.read(
        'tokens',
        typeof token === 'string' ? token : (token || [])[0]
      );

      cb(200, tokenData);
    } catch (err) {
      cb(404, err);
    }
  },

  /*
   * required data: phone, password
   * optional data: none
   *
   * only authenticated users may create a token
   */
  post: async ({payload}, cb) => {
    performance.mark(PerformanceMarks.START_INPUT_VALIDATON);
    const phone = validatePhone(payload.phone);
    const password = validatePassword(payload.password);
    const fields = [phone, password];
    const invalidFields = fields.filter(
      field => Boolean(field) && Boolean(field.error)
    );
    const isValid = invalidFields.length === 0;
    performance.mark(PerformanceMarks.END_INPUT_VALIDATION);

    if (isValid) {
      try {
        performance.mark(PerformanceMarks.START_USER_LOOKUP);
        const user: User = await dataLib.read('users', phone);
        performance.mark(PerformanceMarks.END_USER_LOOKUP);

        performance.mark(PerformanceMarks.START_HASH_PASSWORD);
        const hashedPassword = helpers.hash(payload.password);
        performance.mark(PerformanceMarks.END_HASH_PASSWORD);

        if (!hashedPassword) {
          return cb(500, {error: `Couldn't hash user's password`});
        }

        if (user.password !== hashedPassword) {
          return cb(400, {error: 'username or password incorrect'});
        }

        performance.mark(PerformanceMarks.START_CREATE_TOKEN);
        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 60;
        const token: Token = {
          expires,
          id: tokenId,
          phone,
        };
        performance.mark(PerformanceMarks.END_CREATE_TOKEN);

        performance.mark(PerformanceMarks.START_TOKEN_STORAGE);
        const tokenData: Token = await dataLib.create('tokens', tokenId, token);
        performance.mark(PerformanceMarks.END_TOKEN_STORAGE);

        Object.keys(performanceMap).map(key => {
          const [start, end] = performanceMap[key];
          performance.measure(key, start, end);
        });

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
   * token, but we do want to extend it, so 'extend' is the only data that PUT expects
   *
   * only authenticated users may create a token
   */
  put: async ({headers, pathname, payload, query}, cb) => {
    const {phone: phoneQuery} = query;

    const {verified, msg, code} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const tokenId = getTokenIdFromPath(pathname);

    const extend = [payload.extend]
      .map(exists('extend is required'))
      .map(equals(true, 'extend must be true'))
      .find(Boolean);

    if (tokenId && !extend.error) {
      try {
        const tokenData: Token = await dataLib.read('tokens', tokenId);

        if (tokenData.expires > Date.now()) {
          const newTokenData: Token = {
            ...tokenData,
            expires: Date.now() + 1000 * 60 * 60,
          };

          try {
            const newData: Token = await dataLib.update(
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
