import {Token} from '../types/entities/tokens';
import {User} from '../types/entities/users';
import {RequestData} from '../types/requests';
import {Service, ServiceConfig, ServiceMethod} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {
  createValidator,
  exists,
  hasErrors,
  isOfType,
} from '../validations/index';
import {validateEmail, validatePassword} from '../validations/users';

import {createErrorResponse} from './utils';
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

const tokensService: Service = {
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
    const {status, title, token} = await evaluateAuthentication(headers);

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
    const pathToken = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    const validatedToken = createValidator(pathToken, 'token')
      .map(exists('token path parameter is required'))
      .find(Boolean);
    const invalidParams = [validatedToken].filter(hasErrors);

    if (invalidParams.length) {
      return createErrorResponse({
        errors: invalidParams,
        instance: pathname,
        status: 400,
        title: 'Invalid path parameters',
      });
    }

    const {status, title, token} = await evaluateAuthentication(headers);

    if (!/2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    if (token.id !== validatedToken.value) {
      return createErrorResponse({
        instance: pathname,
        status: 403,
        title: `You are not authorised to access this token`,
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
    const {status, title, token} = await evaluateAuthentication(headers);

    if (!/2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    if (tokenId !== token.id) {
      return createErrorResponse({
        instance: pathname,
        status: 403,
        title: `You may not update the expiry of a token other than your current token`,
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
    const data: Token = {
      expires,
      id,
      userId: email.value,
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

const tokensConfig: ServiceConfig = {
  allowedMethods: ['delete', 'get', 'post', 'patch'],
  name: 'tokens',
  path: 'tokens/:tokenId',
  service: tokensService,
};

export {tokensConfig};
