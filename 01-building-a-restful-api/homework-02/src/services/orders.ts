import {MenuItem} from '../types/entities/menu-items';
import {Order, OrderLineItem, OrderStatus} from '../types/entities/orders';
import {Service} from '../types/services';

import * as dataLib from '../data';
import {createRandomString} from '../helpers';

import {createValidator, exists, hasErrors} from '../validations';
import {validateLineItems} from '../validations/line-items';
import {createErrorResponse, createService} from './utils';
import {evaluateAuthentication} from './utils/authentication';

interface OrderPostPayload {
  lineItems: {id: MenuItem['id']; quantity: OrderLineItem['quantity']};
}

const BASE_DIR = 'orders';

const orderMethods: Service<Order> = {
  /**
   * delete an order
   *
   * /orders/:orderId
   *
   * @param {object} request - request data
   * @param {object} request.headers - request headers
   * @param {string} request.pathname - request path
   * @returns {object} - success / error response
   */
  delete: async ({headers, pathname}) => {
    const {status, title} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const [_, orderId] = pathname
      .split('/')
      .filter(p => !/\//.test(p))
      .filter(Boolean);
    const validatedOrderId = createValidator(orderId, 'orderId')
      .map(exists('orderId is required'))
      .find(Boolean);
    const invalidParams = [validatedOrderId].filter(hasErrors);

    if (invalidParams.length) {
      return createErrorResponse({
        errors: invalidParams,
        instance: pathname,
        status: 400,
        title: 'Invalid path params',
      });
    }

    try {
      await dataLib.read(BASE_DIR, orderId);
      await dataLib.remove(BASE_DIR, orderId);

      return {metadata: {status: 200}};
    } catch (err) {
      return {metadata: {status: 204}};
    }
  },

  /**
   * get an order
   *
   * /orders/:orderId
   *
   * @param {object} request - request data
   * @param {object} request.headers - request headers
   * @param {string} request.pathname - request path
   * @returns {object} - success / error response
   */
  get: async ({headers, pathname}) => {
    const {status, title} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const [_, orderId] = pathname
      .split('/')
      .filter(p => !/\//.test(p))
      .filter(Boolean);
    const validatedOrderId = createValidator(orderId, 'orderId')
      .map(exists('orderId is required'))
      .find(Boolean);
    const invalidParams = [validatedOrderId].filter(hasErrors);

    if (invalidParams.length) {
      return createErrorResponse({
        errors: invalidParams,
        instance: pathname,
        status: 400,
        title: 'Invalid path params',
      });
    }

    try {
      const result: Order = await dataLib.read(BASE_DIR, orderId);

      return {metadata: {status: 200}, payload: result};
    } catch (err) {
      return createErrorResponse({
        instance: pathname,
        status: 404,
        title: 'Not found',
      });
    }
  },

  /**
   * patch an order
   *
   * /orders/:orderId
   *
   * @param {object} request - request data
   * @param {object} request.headers - request headers
   * @param {string} request.pathname - request path
   * @param {object} payload - data to update order with
   * @param {object} payload - data to update order with
   * @param {object} payload.lineItems - line items to update order with
   * @returns {object} - success / error response
   */
  patch: async ({headers, pathname}, payload) => {
    const {status, title} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const [_, orderId] = pathname
      .split('/')
      .filter(p => !/\//.test(p))
      .filter(Boolean);
    const validatedOrderId = createValidator(orderId, 'orderId')
      .map(exists('orderId is required'))
      .find(Boolean);
    const invalidPathParams = [validatedOrderId].filter(hasErrors);

    if (invalidPathParams.length) {
      return createErrorResponse({
        errors: invalidPathParams,
        instance: pathname,
        status: 400,
        title: 'Invalid path params',
      });
    }

    const lineItems = validateLineItems(payload.lineItems);
    const invalidParams = [...lineItems].filter(hasErrors);

    if (invalidParams.length) {
      return createErrorResponse({
        errors: invalidParams,
        instance: pathname,
        status: 400,
        title: 'Invalid params',
      });
    }

    try {
      const result: Order = await dataLib.patch(BASE_DIR, orderId, {
        lineItems: [...lineItems].map(lineItem => lineItem.value),
      });

      return {metadata: {status: 200}, payload: result};
    } catch (err) {
      return createErrorResponse({
        instance: pathname,
        status: 404,
        title: 'Not found',
      });
    }
  },

  /**
   * create an order for an authenticated user
   *
   * @param {object} request - request data
   * @param {object} request.headers - request headers
   * @param {object} payload - request payload
   * @param {array} payload.lineItems - line items to create the order with
   * @returns {object} - either success with created order or failure response
   */
  post: async ({headers, pathname}, payload) => {
    const {status, title, token} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${status}`)) {
      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const requireFields = ['lineItems'];
    const missingRequiredFields = Object.keys(payload).filter(
      key => requireFields.indexOf(key) === -1
    );

    if (missingRequiredFields.length) {
      return createErrorResponse({
        errors: missingRequiredFields,
        instance: pathname,
        status: 400,
        title: 'Missing required fields',
      });
    }

    const lineItems = validateLineItems(payload.lineItems);
    const invalidLineItems = [...lineItems].filter(hasErrors);

    if (invalidLineItems.length) {
      return createErrorResponse({
        errors: invalidLineItems,
        instance: pathname,
        status: 400,
        title: 'Invalid line items',
      });
    }

    try {
      const id = createRandomString(8);
      const userId = token.userId;
      const orderStatus = OrderStatus.Unpaid;
      const order: Order = {
        id,
        lineItems: [...lineItems].map(lineItem => lineItem.value),
        status: orderStatus,
        userId,
      };
      const result = await dataLib.create(BASE_DIR, id, order);

      return {
        metadata: {status: 201},
        payload: result,
      };
    } catch (err) {
      return createErrorResponse({
        status: 500,
        title: `Couldn't create order`,
      });
    }
  },
};

const allowedMethods = ['get', 'post', 'patch', 'delete'];

const orders = createService(allowedMethods, orderMethods);

export {orders};
