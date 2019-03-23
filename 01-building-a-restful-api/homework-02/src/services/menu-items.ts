import {debuglog} from 'util';

import {MenuItem} from '../types/entities/menu-items';
import {Service, ServiceConfig} from '../types/services';

import {menuItems} from '../fixtures/menu-items';
import {createErrorResponse} from './utils';
import {evaluateAuthentication} from './utils/authentication';

const debug = debuglog('menu-items');

const menuItemsService: Service<MenuItem> = {
  /**
   * Get menu items
   *
   * /menu-items
   *
   * @param {object} request - request object
   * @param {object} request.headers - request headers
   * @param {string} request.pathname - request pathname
   * @returns {Promise} - either a success response with menu items as payload, or an error response
   */
  get: async ({headers, pathname}) => {
    const {status, title} = await evaluateAuthentication(headers);

    if (!/^2\d{2}/.test(`${status}`)) {
      debug(JSON.stringify(headers));

      return createErrorResponse({
        instance: pathname,
        status,
        title,
      });
    }

    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      return {metadata: {status: 200}, payload: menuItems};
    } else {
      return createErrorResponse({
        instance: pathname,
        status: 404,
        title: 'Not found',
      });
    }
  },
};

const menuItemsConfig: ServiceConfig = {
  allowedMethods: ['get'],
  name: 'menu-items',
  path: 'menu-items',
  service: menuItemsService,
};

export {menuItemsConfig};
