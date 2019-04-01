import * as https from 'https';
import * as querystring from 'querystring';

import {config} from '../config';
import {createRequest} from '../helpers/create-request';

import {StripeCustomer} from '../types/entities/stripe-customer';
import {StripeSource} from '../types/entities/stripe-source';

const {stripe} = config.apis;
const {apiKey, secretKey} = stripe;

enum SourceType {
  AchCreditTransfer = 'ach_credit_transfer',
}

const baseRequestOptions: https.RequestOptions = {
  headers: {
    Authorization: `Bearer ${secretKey}`,
    // send data as form data
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  hostname: 'api.stripe.com',
  method: 'POST',
  protocol: 'https:',
};

const createStripeRequest = (options: https.RequestOptions, payload?: any) => {
  const stringifiedPayload = querystring.stringify(payload);
  const reqOptions = {
    ...options,
    headers: {
      // set the content length of the payload
      // This helps the receiving server know when the request's data has
      // finished sending
      'Content-length': stringifiedPayload
        ? Buffer.byteLength(stringifiedPayload)
        : 0,
      ...options.headers,
    },
  };

  return createRequest(reqOptions, stringifiedPayload);
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

type CreateSource = (options: {
  email: CreateSourceOptions['owner']['email'];
  [key: string]: any;
}) => Promise<StripeSource>;
/**
 * createSource
 *
 * Create a new source in Stripe
 *
 * @param {string} email - the email address of the owner of the source
 * @returns {object} - either the new source, or an error
 */
const createSource: CreateSource = async ({email, ...rest}) => {
  const payload = {
    ...sourceOptionDefaults,
    ...rest,
    'owner[email]': email,
  };
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: '/v1/sources',
  };

  try {
    const result: StripeSource = await createStripeRequest(
      requestOptions,
      payload
    );

    return result;
  } catch (err) {
    throw err;
  }
};

type DeleteSource = (id: string) => Promise<any>;
/**
 * deleteSource
 *
 * Delete a source in Stripe
 *
 * @param {string} id - the id of the source to delete
 * @returns {object} - either the new source, or an error
 */
const deleteSource: DeleteSource = async id => {
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: `/v1/sources/${id}`,
  };

  try {
    const result = await createStripeRequest(requestOptions);

    return result;
  } catch (err) {
    throw err;
  }
};

interface CreateChargeOptions {
  customer: StripeCustomer['id'];
  source: StripeSource['id'];
  amount: number;
  currency: string;
}
const baseChargeOptions: Partial<CreateChargeOptions> = {
  currency: 'usd',
};
type CreateCharge = (options: Partial<CreateChargeOptions>) => Promise<any>;
/**
 * createCharge
 *
 * Create a new charge in Stripe
 *
 * @param {object} options - options to set on the user
 * @param {string} options.customer - stripe customer id
 * @param {string} options.source - stripe source id
 * @param {number} options.amount - amount to charge
 * @param {string} options.currency - currency to charge in
 * @returns {object} - either the customer from Stripe, or an error
 */
const createCharge: CreateCharge = async options => {
  const payload = {...baseChargeOptions, ...options};
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: '/v1/charges',
  };
  try {
    const result = await createStripeRequest(requestOptions, payload);

    return result;
  } catch (err) {
    throw err;
  }
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
    path: '/v1/customers',
  };
  try {
    const result = await createStripeRequest(requestOptions, payload);

    return result;
  } catch (err) {
    throw err;
  }
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
    path: `/v1/customers/${id}`,
  };

  try {
    const result = await createStripeRequest(requestOptions, payload);

    return result;
  } catch (err) {
    throw err;
  }
};

type DeleteCustomer = (id: string) => Promise<any>;
/**
 * deleteCustomer
 *
 * Delete an existing customer in Stripe
 *
 * @param {string} id - Stripe id of customer to update
 * @param {object} options - options to update on the user
 * @returns {object} - either the customer from Stripe, or an error
 */
const deleteCustomer: DeleteCustomer = async id => {
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    method: 'DELETE',
    path: `/v1/customers/${id}`,
  };

  try {
    const result = await createStripeRequest(requestOptions);

    return result;
  } catch (err) {
    throw err;
  }
};

export {
  createCharge,
  createCustomer,
  createSource,
  deleteCustomer,
  deleteSource,
  updateCustomer,
};
