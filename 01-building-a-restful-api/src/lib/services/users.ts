import dataLib from '../data';
import helpers from '../helpers';
import {exists, isOfType, minLength, trim} from '../validate';

import {Handler, RequestData} from './types';

interface UserPostPayload {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  tosAgreement: boolean;
}

interface UserMethods {
  delete: Handler;
  get: Handler;
  post: Handler<UserPostPayload>;
  put: Handler;
  [key: string]: any;
}

const userMethods: UserMethods = {
  delete: (data, cb) => {},
  get: (data, cb) => {},

  // required data: fiestName, lastName, phone, password, tosAgreement
  post: async ({payload}, cb) => {
    const firstName = [payload.firstName]
      .map(exists('First name is required'))
      .map(isOfType('Must be a string', {types: ['string']}))
      .map(trim())
      .find(Boolean);
    const lastName = [payload.lastName]
      .map(exists('Last name is required'))
      .map(isOfType('Must be a string', {types: ['string']}))
      .map(trim())
      .find(Boolean);
    const phone = [payload.phone]
      .map(exists('Phone is required'))
      .map(isOfType('Must be a string', {types: ['string']}))
      .map(minLength('Phone must be at least 10 chars', {length: 10}))
      .map(trim())
      .find(Boolean);
    const password = [payload.password]
      .map(exists('Password is required'))
      .map(isOfType('Must be a string', {types: ['string']}))
      .map(minLength('Password must be at least 8 chars', {length: 8}))
      .map(trim())
      .find(Boolean);
    const tosAgreement = [payload.tosAgreement]
      .map(exists('TOS is required'))
      .map(isOfType('Must be boolean', {types: ['boolean']}))
      .find(Boolean);
    const fields = [firstName, lastName, password, phone, tosAgreement];
    const invalidFields = fields.filter(
      field => Boolean(field) && Boolean(field.error)
    );
    const isValid = invalidFields.length > 0;

    if (isValid) {
      try {
        await dataLib.read('users', payload.phone);
      } catch (err) {
        const hashedPassword = helpers.hash(payload.password);

        if (!hashedPassword) {
          return cb(500, {Error: `Couldn't hash user's password`});
        }

        const userObject = {
          firstName,
          hashedPassword,
          lastName,
          phone,
          tosAgreement,
        };

        try {
          await dataLib.create('users', phone as any, userObject);

          cb(200);
        } catch (err) {
          cb(500, err);
        }
      }
    } else {
      cb(400, {Error: `invalid fields: ${JSON.stringify(invalidFields)}`});
    }
  },

  put: (data, cb) => {},
};

export const users: Handler = (data, cb) => {
  const allowedMethods = ['get', 'put', 'post', 'delete'];

  if (allowedMethods.indexOf(data.method) > -1) {
    userMethods[data.method](data, cb);
  } else {
    // indicate that method is not allowed
    cb(405);
  }
};
