import {Token} from '../types/entities/tokens';
import {User} from '../types/entities/users';
import {RequestData} from '../types/requests';
import {Service, ServiceMethod} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {hasErrors} from '../validations/index';
import {validateEmail, validatePassword} from '../validations/users';

import {createErrorResponse, createService} from './utils';

interface TokenPostPayload {
  email?: User['email'];
  password?: User['password'];
}

// one hour expiry
const EXPIRY_TIME = 1000 * 60 * 60;
const BASE_DIR = 'tokens';

const tokenMethods: Service = {
  post: async (req, payload: TokenPostPayload = {}) => {
    const password = validatePassword(payload.password);
    const email = validateEmail(payload.email);
    const invalidFields = [password, email].filter(hasErrors);

    if (!invalidFields.length) {
      const id = createHash(createRandomString(10));
      const expires = Date.now() + EXPIRY_TIME;
      const data = {
        email,
        expires,
        id,
      };

      try {
        await dataLib.create(`${BASE_DIR}/${id}.json`, data);

        return {metadata: {status: 201}, payload: JSON.stringify(data)};
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          instance: req.pathname,
          status: 500,
          title: err.code,
        });
      }
      return {payload: {id: '1'}, metadata: {status: 201}};
    } else {
      return createErrorResponse({
        errors: invalidFields,
        status: 400,
        title: 'Invalid fields',
      });
    }
  },
};

const allowedMethods = ['delete', 'get', 'post', 'put'];

const tokens: ServiceMethod<string> = createService(
  allowedMethods,
  tokenMethods
);

export {tokens};
