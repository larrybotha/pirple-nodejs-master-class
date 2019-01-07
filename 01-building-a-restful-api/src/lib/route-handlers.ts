import * as http from 'http';
import {ParsedUrlQuery} from 'querystring';

import dataLib from './data';
import helpers from './helpers';

export interface RequestData {
  headers: http.IncomingHttpHeaders;
  method: string;
  pathname: string;
  payload?: any;
  query?: ParsedUrlQuery;
}

type HandlerCallback = (statusCode: number, responseData?: object) => void;
export type Handler = (data: RequestData, cb: HandlerCallback) => void;

export const notFound: Handler = (data, cb) => {
  cb(404);
};

// a ping handler purely for clients to evaluate whether the server is up or not
export const ping: Handler = (data, cb) => {
  cb(200);
};

const _users: {[key: string]: Handler} = {
  delete: (data, cb) => {},
  get: (data, cb) => {},

  // required data: fiestName, lastName, phone, password, tosAgreement
  post: async (
    {
      payload,
    }: {
      payload?: {
        firstName: string;
        lastName: string;
        password: string;
        phone: string;
        tosAgreement: boolean;
      };
    },
    cb
  ) => {
    const firstName =
      typeof payload.firstName === 'string' &&
      payload.firstName.trim().length > 0
        ? payload.firstName
        : false;
    const lastName =
      typeof payload.lastName === 'string' && payload.lastName.trim().length > 0
        ? payload.lastName
        : false;
    const phone =
      typeof payload.phone === 'string' && payload.phone.trim().length > 10
        ? payload.phone
        : false;
    const password =
      typeof payload.password === 'string' && payload.password.trim().length > 8
        ? payload.password
        : false;
    const tosAgreement =
      typeof payload.tosAgreement === 'boolean' && payload.tosAgreement;

    const isValid = [firstName, lastName, password, phone, tosAgreement].every(
      Boolean
    );

    if (isValid) {
      try {
        await dataLib.read('users', payload.phone);

        const password = helpers.hash(payload.password);
      } catch (err) {
        cb(400, err);
      }
    } else {
      cb(400, {Error: 'invalid fields'});
    }
  },
  put: (data, cb) => {},
};

export const users: Handler = (data, cb) => {
  const allowedMethods = ['get', 'put', 'post', 'delete'];

  if (allowedMethods.indexOf(data.method) > -1) {
    _users[data.method](data, cb);
  } else {
    // indicate that method is not allowed
    cb(405);
  }
};
