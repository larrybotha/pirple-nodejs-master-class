import {RequestData} from '../types/requests';
import {Service, ServiceMethod} from '../types/services';
import {Token} from '../types/entities/tokens';
import {User} from '../types/entities/users';

import * as dataLib from '../data';
import {hasErrors} from '../validations';
import {validatePassword, validateEmail} from '../validations/users';

import {createService, createErrorResponse} from './utils';

interface TokenPostPayload {
  email?: User['email'];
  password?: User['password'];
}

const tokenMethods: Service<Token> = {
  post: (req, payload: TokenPostPayload = {}) => {
    debugger;
    const password = validatePassword(payload.password).find(Boolean);
    const email = validateEmail(payload.email).find(Boolean);
    const invalidFields = [password, email].filter(hasErrors);

    if (!invalidFields.length) {
    } else {
      return createErrorResponse({
        title: 'Invalid fields',
        errors: invalidFields,
        status: 400,
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
