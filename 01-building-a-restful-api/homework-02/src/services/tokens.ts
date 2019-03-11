import {Token} from '../types/entities/tokens';
import {User} from '../types/entities/users';
import {RequestData} from '../types/requests';
import {Service, ServiceMethod} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {createValidator, hasErrors, isOfType} from '../validations/index';
import {validateEmail, validatePassword} from '../validations/users';

import {createErrorResponse, createService} from './utils';
import {evaluateAuthentication} from './utils/authentication';

interface TokenPostPayload {
  email?: User['email'];
  password?: User['password'];
}

interface TokenPatchPayload {
  expiry: number;
}

// one hour expiry
const EXPIRY_TIME = 1000 * 60 * 60;
const BASE_DIR = 'tokens';

const getExpiresTime = () => {
  return Date.now() + EXPIRY_TIME;
};

const tokenMethods: Service = {
  /*
   * Delete a token for an authenticated user
   *
   * Required headers:
   * Authorization: hmac email:[token id]
   */
  delete: async ({headers, pathname}) => {
    const tokenId = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    const {status, title, token} = await evaluateAuthentication(
      headers,
      tokenId
    );

    if (!/2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    try {
      await dataLib.read(BASE_DIR, tokenId);
      await dataLib.remove(BASE_DIR, tokenId);

      return {metadata: {status: 200}};
    } catch (err) {
      return {metadata: {status: 204}};
    }
  },

  /*
   * Get a token for an authenticated user
   *
   * Required headers:
   * Authorization: hmac email:[token id]
   */
  get: async ({headers, pathname}) => {
    const tokenId = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    const {status, title, token} = await evaluateAuthentication(
      headers,
      tokenId
    );

    if (!/2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    return {metadata: {status}, payload: token};
  },

  /*
   * Update a token's expiration
   *
   * Required headers:
   * Authorization: hmac email:[token id]
   *
   * @param payload {object} - data sent as the body of the request
   * @param payload.extend {boolean} - whether to extend the token or not
   *
   * @return ErrorResponse | SuccessResponse
   */
  patch: async ({headers, pathname}, payload) => {
    const tokenId = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    const {status, title, token} = await evaluateAuthentication(
      headers,
      tokenId
    );

    if (!/2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const extend = createValidator(payload.extend, 'extend')
      .map(isOfType({type: 'boolean'}, 'extend must boolean'))
      .find(Boolean);
    const invalidFields = [extend].filter(hasErrors);

    if (invalidFields.length) {
      return createErrorResponse({
        errors: invalidFields,
        instance: pathname,
        status: 400,
        title: 'Invalid fields',
      });
    }

    try {
      const expires = getExpiresTime();
      const newTokenData = extend.value ? {...token, expires} : {...token};

      if (extend.value) {
        await dataLib.update(BASE_DIR, tokenId, newTokenData);
      }

      return {metadata: {status}, payload: newTokenData};
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: 500,
        title: `Unable to update token`,
      });
    }
  },

  /*
   * Create a new token
   *
   * Required params:
   * - email
   * - password
   */
  post: async (req, payload: TokenPostPayload = {}) => {
    const password = validatePassword(payload.password);
    const email = validateEmail(payload.email);
    const invalidFields = [password, email].filter(hasErrors);
    let user: User;

    if (invalidFields.length) {
      return createErrorResponse({
        errors: invalidFields,
        instance: req.pathname,
        status: 400,
        title: 'Invalid fields',
      });
    }

    // confirm user exists
    try {
      user = await dataLib.read('users', email.value);
      const hashedPassword = createHash(password.value);

      if (hashedPassword !== user.password) {
        throw Error;
      }
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: req.pathname,
        status: 400,
        title: 'Incorrect username or password',
      });
    }

    // create token
    const id = createRandomString(10);
    const expires = getExpiresTime();
    const data = {
      email: email.value,
      expires,
      id,
    };

    try {
      await dataLib.create(BASE_DIR, id, data);

      return {metadata: {status: 201}, payload: data};
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: req.pathname,
        status: 500,
        title: err.code,
      });
    }
  },
};

const allowedMethods = ['delete', 'get', 'post', 'patch'];

const tokens: ServiceMethod<string> = createService(
  allowedMethods,
  tokenMethods
);

export {tokens};
