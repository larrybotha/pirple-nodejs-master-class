import {MenuItem} from '../types/entities/menu-items';
import {Order, OrderLineItem, OrderStatus} from '../types/entities/orders';
import {Service} from '../types/services';

import {createRandomString} from '../helpers';

import {hasErrors} from '../validations';
import {validateLineItems} from '../validations/line-items';
import {createErrorResponse, createService} from './utils';

interface OrderPostPayload {
  lineItems: {id: MenuItem['id']; quantity: OrderLineItem['quantity']};
}

const BASE_DIR = 'orders';

const orderMethods: Service<Order> = {
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
    const invalidLineItems = lineItems.filter(hasErrors);

    if (invalidLineItems) {
      return createErrorResponse({
        errors: invalidLineItems,
        instance: pathname,
        status: 400,
        title: 'Invalid line items',
      });
    }

    try {
      const id = createRandomString(8);

      return {
        metadata: {status: 201},
        payload: {id, lineItems: [], status: OrderStatus.Unpaid, userId: 's'},
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
