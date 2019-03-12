import * as http from 'http';

import {Token} from '../../types/entities/tokens';
import {ResponseDataError} from '../../types/responses';

import * as dataLib from '../../data';

interface AuthenticationResult {
  status: number;
  title?: ResponseDataError['title'];
  token?: Token;
}

type EvaluateAuthentication = (
  headers: http.IncomingHttpHeaders
) => Promise<AuthenticationResult>;
const evaluateAuthentication: EvaluateAuthentication = async headers => {
  const errorResponse = {status: 401, title: 'Not authenticated'};
  const hmac = (headers.authorization || '')
    .split(' ')
    .slice(-1)
    .find(Boolean);
  const [email, tokenId] = /:/.test(hmac) ? hmac.split(':') : ':';

  try {
    const token: Token = await dataLib.read('tokens', tokenId);

    if (Date.now() > token.expires) {
      return errorResponse;
    }

    return {status: 200, token};
  } catch (err) {
    return errorResponse;
  }
};

export {evaluateAuthentication};
