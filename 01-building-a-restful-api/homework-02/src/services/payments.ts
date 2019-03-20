import {debuglog} from 'util';

import {Payment} from '../types/entities/payments';
import {ResponseError} from '../types/responses';
import {Service} from '../types/services';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {createValidator, exists, hasErrors, Validation} from '../validations';

import {createErrorResponse, createService} from './utils';
import {evaluateAuthentication} from './utils/authentication';
import {getInvalidParamsResponse} from './utils/invalid-params';

const debug = debuglog('payments');
const BASE_DIR = 'payments';

const paymentMethods: Service<Payment> = {
  /**
   * Get a payment
   *
   * /payments/:paymentId
   *
   * @param {object} request - request data
   * @param {string} request.pathname - service path and params
   * @param {object} request.headers - request headers
   * @returns {object} response - error response or payment
   */
  get: async ({headers, pathname}) => {
    const {status: authStatus, title, token} = await evaluateAuthentication(
      headers
    );

    if (!/^2\d{2}/.test(`${authStatus}`)) {
      return createErrorResponse({
        status: authStatus,
        title,
      });
    }

    try {
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: 404,
        title: 'Payment not found',
      });
    }
  },

  /**
   * Patch a payment
   *
   * /payments/:email
   *
   * @param {object} request - request data
   * @param {string} request.pathname - service path and params
   * @param {object} request.headers - request headers
   * @param {object} payload - payload sent in the request
   * @returns {object} response - error response or updated payment
   */
  patch: async ({headers, pathname}, payload) => {
    const {status: authStatus, title, token} = await evaluateAuthentication(
      headers
    );

    if (!/^2\d{2}/.test(`${authStatus}`)) {
      return createErrorResponse({
        instance: pathname,
        status: authStatus,
        title,
      });
    }

    try {
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: 404,
        title: 'Payment not found',
      });
    }
  },

  /**
   * Create a payment
   *
   * /payments
   *
   * @param {object} request - request data
   * @param {object} payload - payload sent in the request
   * @returns {object} response - error response or created payment
   */
  post: async (req, payload) => {
    try {
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: 500,
        title: err.code,
      });
    }
  },
};

const allowedMethods = ['get', 'post'];

const payments = createService(allowedMethods, paymentMethods);

export {payments};
