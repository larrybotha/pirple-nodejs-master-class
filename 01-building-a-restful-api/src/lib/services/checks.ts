import * as http from 'http';

import dataLib from '../data';
import helpers from '../helpers';
import {equals, exists, Invalid, Valid, Validator} from '../validate';
import {createServiceRouter} from './utils/index';
import {Handler, RequestData} from './utils/types';

import config from '../../config';

const checksConfig = config.services.checks;

const allowedProtocolsRegex = /https?/;

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
  post: ({payload}) => {
    const protocol = [payload.protocol].map(exists('protocol is required')).map(
      (prot): Valid | Invalid => {
        const validateProt = (val: string) =>
          allowedProtocolsRegex.test(val)
            ? val
            : {error: 'Protocol must be one of http or https'};

        return Boolean(prot) && Boolean(prot.error) ? prot : validateProt(prot);
      }
    );
  },

  put: () => {},
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const checks = createServiceRouter(allowedMethods, checksMethods);

export {checks};
