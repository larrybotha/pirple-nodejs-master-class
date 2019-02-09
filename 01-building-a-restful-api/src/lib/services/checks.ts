import * as http from 'http';

import dataLib from '../data';
import helpers from '../helpers';
import {Handler, RequestData} from '../types';
import {Check} from '../types/services/checks';
import {createServiceRouter} from './utils';
import {verifyToken} from './utils/verify-token';
import {
  equals,
  exists,
  Invalid,
  isInstanceOf,
  isOfType,
  minLength,
  oneOf,
  trim,
  Valid,
  Validator,
} from './validations';

import config from '../../config';

const checksConfig = config.services.checks;

const checksAllowedProtocols = ['https', 'http'];
const checksAllowedMethods = ['get', 'put', 'post', 'delete'];

interface PayloadRequiredParams {
  protocol: Check['protocol'];
  url: Check['url'];
  method: Check['method'];
  successCodes: Check['successCodes'];
  timeoutSeconds: Check['timeoutSeconds'];
}

interface ChecksMethods {
  delete: Handler;
  get: Handler;
  post: Handler<PayloadRequiredParams>;
  put: Handler<PayloadRequiredParams>;
  [key: string]: any;
}

const checksMethods: ChecksMethods = {
  delete: async ({headers, pathname}, cb) => {
    const {code, msg, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const [_, checkId] = pathname.split('/');

    try {
      const phone =
        headers.phone instanceof Array ? headers.phone[0] : headers.phone;

      try {
        const userData = await dataLib.read('users', phone);
        const newUserData = {
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

    const [_, checkId] = pathname.split('/');

    if (checkId) {
      try {
        const phoneHeader = headers.phone;
        const phone =
          phoneHeader instanceof Array ? phoneHeader[0] : phoneHeader;
        const userData = await dataLib.read('users', phone);
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

    const protocol = [payload.protocol]
      .map(exists('protocol is required'))
      .map(
        oneOf(
          `protocol must be one of ${checksAllowedProtocols.join(', ')}`,
          checksAllowedProtocols
        )
      )
      .find(Boolean);
    const url = [payload.url]
      .map(exists('url is required'))
      .map(trim())
      .find(Boolean);
    const method = [payload.method]
      .map(exists('method is required'))
      .map(
        oneOf(
          `method must be one of ${checksAllowedMethods.join(',')}`,
          checksAllowedMethods
        )
      )
      .find(Boolean);
    const successCodes = [payload.successCodes]
      .map(exists('successCodes is required'))
      .map(isInstanceOf('Must be an array', Array))
      .map(minLength('successCodes must have min length of 1', {length: 1}))
      .find(Boolean);
    const timeoutSeconds = [payload.timeoutSeconds]
      .map(exists('timeoutSeconds is required'))
      .map(isOfType('Must be a number', {types: ['number']}))
      .find(Boolean);
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
        const user = await dataLib.read('users', phone);
        const userChecks = user.checks || [];

        if (userChecks.length < checksConfig.maxChecks) {
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
              checks: userChecks.concat(checkId),
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

    const protocol = [payload.protocol]
      .map(exists('protocol is required'))
      .map(
        oneOf(
          `protocol must be one of ${checksAllowedProtocols.join(', ')}`,
          checksAllowedProtocols
        )
      )
      .find(Boolean);
    const url = [payload.url]
      .map(exists('url is required'))
      .map(trim())
      .find(Boolean);
    const method = [payload.method]
      .map(exists('method is required'))
      .map(
        oneOf(
          `method must be one of ${checksAllowedMethods.join(',')}`,
          checksAllowedMethods
        )
      )
      .find(Boolean);
    const successCodes = [payload.successCodes]
      .map(exists('successCodes is required'))
      .map(isInstanceOf('Must be an array', Array))
      .map(minLength('successCodes must have min length of 1', {length: 1}))
      .find(Boolean);
    const timeoutSeconds = [payload.timeoutSeconds]
      .map(exists('timeoutSeconds is required'))
      .map(isOfType('Must be a number', {types: ['number']}))
      .find(Boolean);
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
        const [_, checkId] = pathname.split('/');
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
