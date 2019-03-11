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
  headers: http.IncomingHttpHeaders,
  tokenIdPathParam: string
) => Promise<AuthenticationResult>;
const evaluateAuthentication: EvaluateAuthentication = async (
  headers,
  tokenIdPathParam
) => {
  const errorResponse = {status: 401, title: 'Not authenticated'};

  const hmac = (headers.authorization || '')
    .split(' ')
    .slice(-1)
    .find(Boolean);
  const [email, tokenId] = /:/.test(hmac) ? hmac.split(':') : ':';

  if (tokenId !== tokenIdPathParam) {
    return errorResponse;
  }

  try {
    const token: Token = await dataLib.read('tokens', tokenIdPathParam);

    if (Date.now() > token.expires) {
      return errorResponse;
    }

    return {status: 200, token};
  } catch (err) {
    return errorResponse;
  }
};

export {evaluateAuthentication};
