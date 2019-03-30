import * as https from 'https';
import * as util from 'util';

import {config} from '../config';
import {safeJSONParse} from '../helpers';

const {stripe} = config.apis;
const {secretKey} = stripe;

enum SourceType {
  AchCreditTransfer = 'ach_credit_transfer',
}

const baseRequestOptions: https.RequestOptions = {
  headers: {Authorization: `Bearer ${secretKey}:`},
  hostname: 'api.stripe.com/v1',
  method: 'POST',
  protocol: 'https:',
};

/**
 * createRequest
 *
 * Helper for creating requests
 *
 * @param {object} - request options for this request
 * @param {any} payload - data to send in request
 * @returns {undefined}
 */
const createRequest = (options: https.RequestOptions, payload: any) => {
  return new Promise((resolve, reject) => {
    const stringifiedPayload = JSON.stringify(payload);
    const requestOptions = {
      ...options,
      headers: {
        // send data as form data
        'Content-Type': 'application/x-www-form-urlencoded',
        // set the content length of the payload
        // This helps the receiving server know when the request's data has
        // finished sending
        'Content-length': Buffer.byteLength(stringifiedPayload),
        ...options.headers,
      },
    };

    const request = https.request(requestOptions, res => {
      const {statusCode} = res;
      let data: string[];
      res.setEncoding('utf8');

      res.on('data', d => (data = data.concat(d)));

      res.on('end', (d: string) => {
        data = data.concat(d);
        const result = safeJSONParse(data.join(''));

        if (/^2/.test(`${statusCode}`)) {
          resolve(result);
        } else {
          reject(result);
        }
      });
    });

    request.on('error', err => reject(err));

    request.end(stringifiedPayload);
  });
};

interface CreateSourceOptions {
  currency: string;
  owner: {email: string};
  type: SourceType;
  usage: string;
}
const sourceOptionDefaults: Partial<CreateSourceOptions> = {
  currency: 'usd',
  type: SourceType.AchCreditTransfer,
  usage: 'reusable',
};

type CreateSource = (
  email: CreateSourceOptions['owner']['email']
) => Promise<any>;
/**
 * createSource
 *
 * Create a new source in Stripe
 *
 * @param {string} email - the email address of the owner of the source
 * @returns {object} - either the new source, or an error
 */
const createSource: CreateSource = async email => {
  const payload = {
    ...sourceOptionDefaults,
    owner: {email},
  };
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: '/sources',
  };
  const result = await createRequest(requestOptions, payload);

  return result;
};

type CreateCustomer = (options: {
  email: string;
  [key: string]: any;
}) => Promise<any>;
/**
 * createCustomer
 *
 * Create a new customer in Stripe
 *
 * @param {object} options - options to set on the user
 * @param {string} options.email - email address for customer
 * @returns {object} - either the customer from Stripe, or an error
 */
const createCustomer: CreateCustomer = async options => {
  const payload = {...options};
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: '/customers',
  };
  debugger;
  const result = await createRequest(requestOptions, payload);

  return result;
};

type UpdateCustomer = (
  id: string,
  options: {[key: string]: any}
) => Promise<any>;
/**
 * updateCustomer
 *
 * Updatea an existing customer in Stripe
 *
 * @param {string} id - Stripe id of customer to update
 * @param {object} options - options to update on the user
 * @returns {object} - either the customer from Stripe, or an error
 */
const updateCustomer: UpdateCustomer = async (id, options) => {
  const payload = {...options};
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: `/customers/${id}`,
  };
  const result = await createRequest(requestOptions, payload);

  return result;
};

export {createCustomer, createSource, updateCustomer};
