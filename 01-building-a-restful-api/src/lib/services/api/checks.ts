import * as http from 'http';

import config from '../../config';
import dataLib from '../data';
import helpers from '../helpers';
import {Handler, RequestData} from '../types';
import {Check} from '../types/services/checks';
import {User} from '../types/services/users';
import {Invalid, Valid} from '../validations';

import {createServiceRouter} from './utils';
import {verifyToken} from './utils/verify-token';
import {
  validateMethod,
  validateProtocol,
  validateSuccessCodes,
  validateTimeoutSeconds,
  validateUrl,
} from './validations/checks';

const checksConfig = config.services.checks;

interface PayloadRequiredParams {
  method: Check['method'];
  protocol: Check['protocol'];
  successCodes: Check['successCodes'];
  timeoutSeconds: Check['timeoutSeconds'];
  url: Check['url'];
}

interface ChecksMethods {
  delete: Handler;
  get: Handler;
  post: Handler<PayloadRequiredParams>;
  put: Handler<PayloadRequiredParams>;
  [key: string]: any;
}

const getCheckIdFromPath = (path: string): string => {
  const parts = path.split('/');

  return parts.length === 3 ? parts.slice(-1).find(Boolean) : '';
};

const checksMethods: ChecksMethods = {
  delete: async ({headers, pathname}, cb) => {
    const {code, msg, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const checkId = getCheckIdFromPath(pathname);

    try {
      const phone =
        headers.phone instanceof Array ? headers.phone[0] : headers.phone;

      try {
        const userData: User = await dataLib.read('users', phone);
        const newUserData: User = {
          ...userData,
          checks: userData.checks.filter((id: string) => id !== checkId),
        };

        await dataLib.update('users', phone, newUserData);
      } catch (err) {
        return cb(404, {error: `Couldn't find user with phone ${phone}`});
      }

      await dataLib.delete('checks', checkId);

      cb(200);
    } catch (err) {
      cb(204);
    }
  },

  get: async ({headers, pathname}, cb) => {
    const {code, msg, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const checkId = getCheckIdFromPath(pathname);

    if (checkId) {
      try {
        const phoneHeader = headers.phone;
        const phone =
          phoneHeader instanceof Array ? phoneHeader[0] : phoneHeader;
        const userData: User = await dataLib.read('users', phone);
        const checkData: Check = await dataLib.read('checks', checkId);

        if (userData.checks.indexOf(checkId) === -1) {
          return cb(403, {
            error: `You're not allowed to request this resource`,
          });
        } else {
          return cb(200, checkData);
        }
      } catch (err) {
        return cb(404, {error: err});
      }
    } else {
      return cb(400, {error: 'No id provided'});
    }
  },

  /*
   * required data: protocol url method successCodes timeoutSeconds
   * optional data: none
   */
  post: async ({headers, payload}, cb) => {
    const {code, msg, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const protocol = validateProtocol(payload.protocol);
    const url = validateUrl(payload.url);
    const method = validateMethod(payload.method);
    const successCodes = validateSuccessCodes(payload.successCodes);
    const timeoutSeconds = validateTimeoutSeconds(payload.timeoutSeconds);
    const invalidFields = [
      protocol,
      url,
      method,
      successCodes,
      timeoutSeconds,
    ].filter(
      (field: Valid | Invalid) => Boolean(field) && Boolean(field.error)
    );

    if (!invalidFields.length) {
      // get user using header data
      const phone =
        headers.phone instanceof Array ? headers.phone[0] : headers.phone;

      try {
        const user: User = await dataLib.read('users', phone);
        const userCheckIds: Array<Check['id']> = user.checks || [];

        if (userCheckIds.length < checksConfig.maxChecks) {
          const checkId = helpers.createRandomString(20);
          const checkData: Check = {
            id: checkId,
            method,
            phone,
            protocol,
            successCodes,
            timeoutSeconds,
            url,
          };

          try {
            const data = await dataLib.create('checks', checkId, checkData);
            await dataLib.update('users', phone, {
              ...user,
              checks: userCheckIds.concat(checkId),
            });

            return cb(201, data);
          } catch (err) {
            cb(500, {error: err});
          }
        } else {
          return cb(422, {
            error: `user has already allocated max checks: ${
              checksConfig.maxChecks
            }`,
          });
        }
      } catch (err) {
        cb(404, {error: `can't find user ${phone}`});
      }
      // evaluate if the user can create any more checks
    } else {
      cb(400, {errors: invalidFields});
    }
  },

  put: async ({headers, payload, pathname}, cb) => {
    const {code, msg, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const protocol = validateProtocol(payload.protocol);
    const url = validateUrl(payload.url);
    const method = validateMethod(payload.method);
    const successCodes = validateSuccessCodes(payload.successCodes);
    const timeoutSeconds = validateTimeoutSeconds(payload.timeoutSeconds);
    const invalidFields = [
      protocol,
      url,
      method,
      successCodes,
      timeoutSeconds,
    ].filter(
      (field: Valid | Invalid) => Boolean(field) && Boolean(field.error)
    );

    if (!invalidFields.length) {
      try {
        const checkId = getCheckIdFromPath(pathname);
        const checkData = await dataLib.read('checks', checkId);
        const newData = {
          ...checkData,
          method,
          protocol,
          successCodes,
          timeoutSeconds,
          url,
        };

        const result = await dataLib.update('checks', checkId, newData);

        cb(200, result);
      } catch (err) {
        return cb(500, {error: err});
      }
    } else {
      return cb(400, {error: invalidFields});
    }
  },
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const checks = createServiceRouter(allowedMethods, checksMethods);

export {checks};
