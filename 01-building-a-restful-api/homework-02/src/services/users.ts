import {User} from '../types/entities/users';
import {Service} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString, safeJSONParse} from '../helpers';
import {hasErrors} from '../validations';
import {validateEmail, validatePassword} from '../validations/users';
import {createErrorResponse, createService} from './utils';

const BASE_DIR = 'users';

const userMethods: Service<User> = {
  /*
   * Delete a user
   *
   * /users/:email
   */
  delete: async ({pathname}, payload) => {
    const email = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);
    let status = 200;

    try {
      await dataLib.read(BASE_DIR, email);
    } catch (err) {
      status = 204;
    }

    try {
      await dataLib.remove(BASE_DIR, email);

      return {metadata: {status}};
    } catch (err) {
      return createErrorResponse({status: 500, errors: [err], title: err.code});
    }
  },

  /*
   * Get a user
   *
   * /users/:email
   */
  get: async ({pathname}, payload) => {
    const email = pathname
      .split('/')
      .slice(-1)
      .find(Boolean);

    try {
      const data: User = await dataLib.read(BASE_DIR, email);

      return {metadata: {status: 200}, payload: data};
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
    } catch (err) {}

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

      return {metadata: {status: 201}, payload: result};
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
