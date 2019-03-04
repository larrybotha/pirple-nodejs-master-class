import {Token} from '../types/entities/tokens';
import {User} from '../types/entities/users';
import {RequestData} from '../types/requests';
import {Service, ServiceMethod} from '../types/services';

import * as dataLib from '../data';
import {hasErrors} from '../validations/index';
import {validateEmail, validatePassword} from '../validations/users';

import {createErrorResponse, createService} from './utils';

interface TokenPostPayload {
  email?: User['email'];
  password?: User['password'];
}

// one hour expiry
const EXPIRY_TIME = 1000 * 60 * 60;

const tokenMethods: Service = {
  post: (req, payload: TokenPostPayload = {}) => {
    const password = validatePassword(payload.password);
    const email = validateEmail(payload.email);
    const invalidFields = [password, email].filter(hasErrors);

    if (!invalidFields.length) {
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
