import {debuglog} from 'util';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {
  OrderPayment,
  OrderPaymentStatus,
} from '../types/entities/order-payments';
import {Order} from '../types/entities/orders';
import {ResponseError} from '../types/responses';
import {Service} from '../types/services';
import {createValidator, hasErrors, Validation} from '../validations';
import {validateAmount} from '../validations/order-payments';

import {createErrorResponse} from './utils';
import {evaluateAuthentication} from './utils/authentication';
import {getInvalidParamsResponse} from './utils/invalid-params';

enum PaymentStatus {
  AdditionalPayment,
  FirstPayment,
}

const debug = debuglog('order-payments');
const BASE_DIR = 'order-payments';

const orderPaymentsService: Service<OrderPayment> = {
  /**
   * Get a payment
   *
   * /orders/:orderId/payments
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

    const [_, orderId] = pathname.split('/').filter(Boolean);

    try {
      const result = await dataLib.read(BASE_DIR, orderId);

      return {metadata: {status: 200}, payload: result};
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
   * /orders/:orderId/payments
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

    const amount = validateAmount(payload.amount);
    const invalidFields = [amount].filter(hasErrors);

    if (invalidFields.length) {
      return createErrorResponse({
        errors: invalidFields,
        instance: pathname,
        status: 400,
        title: 'Invalid fields',
      });
    }

    const [_, orderId] = pathname.split('/').filter(Boolean);

    try {
      const orderPayment: OrderPayment = await dataLib.read(BASE_DIR, orderId);
      const newOrderPayment: OrderPayment = {
        ...orderPayment,
        entities: orderPayment.entities.concat({
          amount: amount.value,
          date: Date.now(),
        }),
      };
      const result: OrderPayment = await dataLib.patch(
        BASE_DIR,
        orderId,
        newOrderPayment
      );

      return {metadata: {status: 200}, payload: result};
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
   * /orders/:orderId/payments
   *
   * @param {object} request - request data
   * @param {object} payload - payload sent in the request
   * @param {number} payload.amount - amount to pay for the order
   * @returns {object} response - error response or created payment
   */
  post: async ({headers, pathname}, payload) => {
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

    const amount = validateAmount(payload.amount);
    const invalidFields = [amount].filter(hasErrors);

    if (invalidFields.length) {
      return createErrorResponse({
        errors: invalidFields,
        instance: pathname,
        status: 400,
        title: 'Invalid fields',
      });
    }

    const [_, orderId] = pathname.split('/').filter(Boolean);
    let paymentStatus: PaymentStatus;
    let orderPayment: OrderPayment;
    let order: Order;

    try {
      orderPayment = await dataLib.read(BASE_DIR, orderId);
      paymentStatus = PaymentStatus.AdditionalPayment;
    } catch (err) {
      paymentStatus = PaymentStatus.FirstPayment;
    }

    // return 404 if no order matches id
    try {
      order = await dataLib.read('orders', orderId);
    } catch (err) {
      return createErrorResponse({
        instance: pathname,
        status: 404,
        title: 'Not found',
      });
    }

    if (token.userId !== order.userId) {
      return createErrorResponse({
        instance: pathname,
        status: 403,
        title: `You are not allowed to create a payment for this order`,
      });
    }

    const orderTotal = order.lineItems.reduce(
      (acc, lineItem) => acc + lineItem.total,
      0
    );

    // if we this is first payment, patch the current order payment
    if (paymentStatus === PaymentStatus.FirstPayment) {
      if (amount.value > orderTotal) {
        return createErrorResponse({
          instance: pathname,
          status: 400,
          title: `You can't pay more than the total of the order`,
        });
      }

      try {
        const orderPaymentData: OrderPayment = {
          entities: [
            {
              amount: amount.value,
              date: Date.now(),
            },
          ],
          orderId,
          status:
            amount.value === orderTotal
              ? OrderPaymentStatus.Paid
              : OrderPaymentStatus.Partial,
          userId: token.userId,
        };
        const result = await dataLib.create(
          BASE_DIR,
          orderId,
          orderPaymentData
        );

        return {metadata: {status: 201}, payload: result};
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          instance: pathname,
          status: 500,
          title: 'Unable to create order payment',
        });
      }
    }

    // if we don't, create a new order-payment with the amount as the first entry
    try {
      return {
        metadata: {status: 201},
        payload: {orderId: 'foo', userId: 'foo', entities: []},
      };
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: 500,
        title: err.code,
      });
    }
  },
};

const orderPaymentsConfig = {
  allowedMethods: ['get', 'patch', 'post'],
  name: 'order-payments',
  path: 'orders/:orderId/payments/:paymentId',
  service: orderPaymentsService,
};

export {orderPaymentsConfig};
