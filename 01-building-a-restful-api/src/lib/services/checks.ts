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
  delete: () => {},

  get: () => {},

  /*
   * required data: protocol url method successCodes timeoutSeconds
   * optional data: none
   */
  post: ({payload}, cb) => {
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
      );
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
      // get token using header data
      // get user data by phone in token data
      // evaluate if the user can create any more checks
    } else {
      cb(400, {errors: invalidFields});
    }
  },

  put: () => {},
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const checks = createServiceRouter(allowedMethods, checksMethods);

export {checks};
