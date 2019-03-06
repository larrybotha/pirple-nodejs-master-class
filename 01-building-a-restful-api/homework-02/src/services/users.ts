import {User} from '../types/entities/users';
import {Service} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString, safeJSONParse} from '../helpers';
import {hasErrors} from '../validations';
import {validateEmail, validatePassword} from '../validations/users';
import {createErrorResponse, createService} from './utils';

const BASE_DIR = 'user';

const userMethods: Service<User> = {
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
    const address = payload.address || null;
    const name = payload.name || null;
    const invalidFields = [email, password].filter(hasErrors);

    if (!invalidFields.length) {
      const hashedPassword = createHash(password.value);
      const id = createRandomString(10);
      const user: User = {
        address,
        email: email.value,
        id,
        name,
        password: hashedPassword,
      };

      try {
        const result = await dataLib.create(BASE_DIR, id, user);

        return {metadata: {status: 201}, payload: safeJSONParse(result)};
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          status: 500,
          title: err.code,
        });
      }
    } else {
      return createErrorResponse({
        errors: invalidFields,
        status: 400,
        title: 'Invalid fields',
      });
    }
  },
};

const allowedMethods = ['delete', 'get', 'patch', 'post', 'put'];

const users = createService(allowedMethods, userMethods);

export {users};
