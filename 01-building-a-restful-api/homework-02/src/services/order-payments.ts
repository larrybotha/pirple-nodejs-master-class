import {debuglog} from 'util';

import {sendEmail} from '../lib/mailgun';
import {createCharge, createSource, updateCustomer} from '../lib/stripe';

import * as dataLib from '../data';
import {createHash, createRandomString} from '../helpers';
import {OrderPayment} from '../types/entities/order-payments';
import {Order, OrderStatus} from '../types/entities/orders';
import {StripeSource} from '../types/entities/stripe-source';
import {User} from '../types/entities/users';
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

    // ensure there is an existing order for this payment
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
    let order: Order;

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

    let user: User;

    try {
      user = await dataLib.read('users', token.userId);
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: 404,
        title: `Can't find user`,
      });
    }

    let stripeSourceId = user.stripeSourceIds.find(Boolean);

    // create stripe source if none on user
    if (!stripeSourceId) {
      try {
        const source: StripeSource = await createSource({email: token.userId});
        await updateCustomer(user.stripeId, {source: source.id});
        stripeSourceId = source.id;

        await dataLib.patch('users', token.userId, {
          stripeSourceIds: [stripeSourceId],
        });
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          status: err.statusCode,
          title: err.message,
        });
      }
    }

    let orderPayment: OrderPayment;

    try {
      orderPayment = await dataLib.read(BASE_DIR, orderId);
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: 404,
        title: `Can't find order`,
      });
    }

    const orderTotal = order.lineItems.reduce(
      (acc, lineItem) => acc + lineItem.total,
      0
    );
    const paymentsTotal = orderPayment.entities.reduce(
      (acc, entity) => acc + entity.amount,
      0
    );

    if (amount.value > orderTotal) {
      return createErrorResponse({
        instance: pathname,
        status: 400,
        title: `You can't pay more than the total of the order`,
      });
    }

    try {
      await createCharge({
        amount: amount.value,
        customer: user.stripeId,
        source: stripeSourceId,
      });
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: err.statusCode,
        title: err.message,
      });
    }

    let result: OrderPayment;

    // get the current payments
    try {
      const newOrderPayment: OrderPayment = {
        ...orderPayment,
        entities: orderPayment.entities.concat({
          amount: amount.value,
          date: Date.now(),
        }),
      };

      result = await dataLib.patch(BASE_DIR, orderId, newOrderPayment);
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        instance: pathname,
        status: err.statusCode,
        title: err.message,
      });
    }

    try {
      await sendEmail({
        body: JSON.stringify(result),
        email: process.env.MAILGUN_TEST_EMAIL,
        subject: 'Successful charge',
      });

      return {metadata: {status: 200}, payload: result};
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: err.statusCode,
        title: err.message,
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

    let user: User;

    try {
      user = await dataLib.read('users', token.userId);
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: 404,
        title: `Can't find user`,
      });
    }

    let stripeSourceId = user.stripeSourceIds.find(Boolean);

    // create stripe source if none on user
    if (!stripeSourceId) {
      try {
        const source: StripeSource = await createSource({email: token.userId});
        await updateCustomer(user.stripeId, {source: source.id});
        stripeSourceId = source.id;

        await dataLib.patch('users', token.userId, {
          stripeSourceIds: [stripeSourceId],
        });
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          status: err.statusCode,
          title: err.message,
        });
      }
    }

    const orderTotal = order.lineItems.reduce(
      (acc, lineItem) => acc + lineItem.total,
      0
    );

    if (amount.value > orderTotal) {
      return createErrorResponse({
        instance: pathname,
        status: 400,
        title: `You can't pay more than the total of the order`,
      });
    }

    // create a charte in stripe
    try {
      await createCharge({
        amount: amount.value,
        customer: user.stripeId,
        source: stripeSourceId,
      });
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: err.statusCode,
        title: err.message,
      });
    }

    let result;

    // if this is first payment, patch the current order payment
    if (paymentStatus === PaymentStatus.FirstPayment) {
      try {
        const orderPaymentData: OrderPayment = {
          entities: [
            {
              amount: amount.value,
              date: Date.now(),
            },
          ],
          orderId,
          userId: token.userId,
        };
        const newOrder: Order = {
          ...order,
          status:
            amount.value === orderTotal
              ? OrderStatus.Paid
              : OrderStatus.Partial,
        };
        [result] = await Promise.all([
          dataLib.create(BASE_DIR, orderId, orderPaymentData),
          dataLib.patch('orders', orderId, newOrder),
        ]);
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          instance: pathname,
          status: 500,
          title: 'Unable to create order payment',
        });
      }
    }

    // if we don't have an existing payment,
    // create a new order-payment with the amount as the first entry
    if (paymentStatus !== PaymentStatus.FirstPayment) {
      try {
        const orderDetails = {
          ...orderPayment,
          entities: [
            ...orderPayment.entities,
            {
              amount: amount.value,
              date: Date.now(),
            },
          ],
        };
        result = dataLib.create(BASE_DIR, orderId, orderDetails);
      } catch (err) {
        return createErrorResponse({
          errors: [err],
          status: 500,
          title: err.code,
        });
      }
    }

    // send the email, and return the payload
    try {
      await sendEmail({
        body: JSON.stringify(result),
        email: process.env.MAILGUN_TEST_EMAIL,
        subject: 'Successful charge',
      });

      return {
        metadata: {status: 201},
        payload: result,
      };
    } catch (err) {
      return createErrorResponse({
        errors: [err],
        status: err.statusCode,
        title: err.message,
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
