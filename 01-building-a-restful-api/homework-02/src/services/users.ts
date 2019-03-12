import {debuglog} from 'util';

import {User} from '../types/entities/users';
import {Service} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString, safeJSONParse} from '../helpers';
import {createValidator, exists, hasErrors} from '../validations';
import {validateEmail, validatePassword} from '../validations/users';

import {createErrorResponse, createService} from './utils';
import {evaluateAuthentication} from './utils/authentication';

const debug = debuglog('users');
const BASE_DIR = 'users';

type UserResponsePayload = Pick<User, Exclude<keyof User, 'password'>>;

type GetAllowedResponsePayload = (user: User) => UserResponsePayload;
const getAllowedResponsePayload: GetAllowedResponsePayload = user => {
  const {password, ...rest} = user;

  return rest;
};

const userMethods: Service<UserResponsePayload> = {
  /*
   * Delete a user
   *
   * /users/:email
   */
  delete: async ({headers, pathname}, payload) => {
    const {status: authStatus, title} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${authStatus}`)) {
      return createErrorResponse({
        status: authStatus,
        title,
      });
    }

    const emailParam = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    const validatedEmail = createValidator(emailParam, 'email')
      .map(exists('email path parameter is required'))
      .find(Boolean);
    const invalidParams = [validatedEmail].filter(hasErrors);

    if (invalidParams.length) {
      return createErrorResponse({
        errors: invalidParams,
        instance: pathname,
        status: 400,
        title: 'Invalid path params',
      });
    }

    let status = 200;

    try {
      await dataLib.read(BASE_DIR, validatedEmail.value);
    } catch (err) {
      status = 204;
    }

    try {
      await dataLib.remove(BASE_DIR, validatedEmail.value);
    } catch (err) {
      return createErrorResponse({status: 500, errors: [err], title: err.code});
    }

    return {metadata: {status}};
  },

  /*
   * Get a user
   *
   * /users/:email
   */
  get: async ({pathname}) => {
    const email = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);

    try {
      const result: User = await dataLib.read(BASE_DIR, email);

      return {
        metadata: {status: 200},
        payload: getAllowedResponsePayload(result),
      };
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: 404,
        title: 'User not found',
      });
    }
  },

  /*
   * Create a user.
   *
   * Required fields:
   *  password
   *  email
   *
   * /users
   */
  post: async (req, payload) => {
    const password = validatePassword(payload.password);
    const email = validatePassword(payload.email);
    const address = payload.address || '';
    const name = payload.name || '';
    const invalidFields = [email, password].filter(hasErrors);

    if (invalidFields.length) {
      return createErrorResponse({
        errors: invalidFields,
        status: 400,
        title: 'Invalid fields',
      });
    }

    try {
      await dataLib.read(BASE_DIR, email.value);

      return createErrorResponse({
        status: 409,
        title: 'User exists',
      });
    } catch (err) {
      debug('Creating user');
    }

    const hashedPassword = createHash(password.value);

    if (!hashedPassword) {
      return createErrorResponse({
        status: 500,
        title: `Couldn't hash password`,
      });
    }

    const id = createRandomString(10);
    const user: User = {
      address,
      email: email.value,
      id,
      name,
      password: hashedPassword,
    };

    try {
      const result = await dataLib.create(BASE_DIR, email.value, user);

      return {
        metadata: {status: 201},
        payload: getAllowedResponsePayload(result),
      };
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: 500,
        title: err.code,
      });
    }
  },
};

const allowedMethods = ['delete', 'get', 'patch', 'post', 'put'];

const users = createService(allowedMethods, userMethods);

export {users};
