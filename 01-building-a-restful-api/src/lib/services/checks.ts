import * as http from 'http';

import dataLib from '../data';
import helpers from '../helpers';
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
} from '../validate';
import {createServiceRouter} from './utils/index';
import {Handler, RequestData} from './utils/types';
import {verifyToken} from './verify-token';

import config from '../../config';

const checksConfig = config.services.checks;

const checksAllowedProtocols = ['https', 'http'];
const checksAllowedMethods = ['get', 'put', 'post', 'delete'];

interface CheckPostPayload {
  protocol: string;
  url: string;
  method: string;
  successCodes: number[];
  timeoutSeconds: number;
}

interface CheckPutPayload {}

interface CheckDeletePayload {}

interface ChecksMethods {
  delete: Handler<CheckDeletePayload>;
  get: Handler;
  post: Handler<CheckPostPayload>;
  put: Handler<CheckPutPayload>;
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
      await dataLib.delete('checks', checkId);

      cb(200);
    } catch (err) {
      cb(204);
    }
  },

  get: (_, cb) => {
    cb(500, {error: 'not implemented'});
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
          const checkData = {
            id: checkId,
            protocol,
            url,
            successCodes,
            timeoutSeconds,
            method,
          };

          try {
            await dataLib.create('checks', checkId, checkData);
            await dataLib.update('users', phone, {
              ...user,
              checks: userChecks.concat(checkId),
            });

            return cb(201, checkData);
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

  put: (_, cb) => {
    cb(500, {error: 'not implemented'});
  },
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const checks = createServiceRouter(allowedMethods, checksMethods);

export {checks};