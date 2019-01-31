import * as http from 'http';

import dataLib from '../data';

// verify if a given token id is valid for the current user
interface TokenValidation {
  code?: number;
  msg?: string;
  verified: boolean;
}
type VerifyToken = (
  headers: http.IncomingHttpHeaders
) => Promise<TokenValidation>;
// tokens are generally sent via request headers
const verifyToken: VerifyToken = async headers => {
  const {phone, token} = headers;

  if (typeof token !== 'string' || !token) {
    return {verified: false, msg: 'invalid token', code: 401};
  }

  if (typeof phone !== 'string' || !phone) {
    return {verified: false, msg: 'invalid phone', code: 401};
  }

  try {
    const tokenData = await dataLib.read('tokens', token);
    const validPhone =
      phone === tokenData.phone
        ? {verified: true}
        : {
            code: 401,
            msg: 'invalid token',
            verified: false,
          };
    const notExpired =
      Date.now() < tokenData.expires
        ? {verified: true}
        : {verified: false, msg: 'token expired', code: 401};

    const invalidation = [validPhone, notExpired].find(
      ({verified}) => !Boolean(verified)
    );

    return invalidation ? invalidation : {verified: true};
  } catch (err) {
    return {verified: false, msg: err, code: 500};
  }
};

export {TokenValidation, verifyToken};
