import dataLib from '../data';
import helpers from '../helpers';
import {equals, exists, isOfType, minLength, trim} from '../validate';

import {createServiceRouter} from './utils/index';
import {Handler, RequestData} from './utils/types';
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateTos,
} from './utils/validations';

interface UserPostPayload {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  tosAgreement: string;
}

interface UserPatchPayload {
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
  [key: string]: any;
}

interface UserMethods {
  delete: Handler;
  get: Handler;
  patch: Handler<UserPatchPayload>;
  post: Handler<UserPostPayload>;
  put: Handler;
  [key: string]: any;
}

const userMethods: UserMethods = {
  delete: async ({pathname}, cb) => {
    const [_, phone] = pathname.split('/');

    try {
      await dataLib.delete('users', phone);

      cb(200);
    } catch (err) {
      cb(200);
    }
  },

  get: async ({pathname}, cb) => {
    const [_, phone] = pathname.split('/');

    try {
      const data = await dataLib.read('users', phone);

      try {
        // return only permitted fields
        const permittedFields = ['firstName', 'lastName', 'phone'];
        const permittedData = permittedFields
          .map(field => ({[field]: data[field]}))
          .reduce((acc, obj) => ({...acc, ...obj}), {});

        cb(200, permittedData);
      } catch (err) {
        cb(500, err);
      }
    } catch (err) {
      cb(404, err);
    }
  },

  // required data: fiestName, lastName, phone, password, tosAgreement
  post: async ({payload}, cb) => {
    const firstName = validateFirstName(payload.firstName);
    const lastName = validateLastName(payload.lastName);
    const phone = validatePhone(payload.phone);
    const password = validatePassword(payload.password);
    const tosAgreement = validateTos(payload.tosAgreement);
    const fields = [firstName, lastName, password, phone, tosAgreement];
    const invalidFields = fields.filter(
      field => Boolean(field) && Boolean(field.error)
    );
    const isValid = invalidFields.length === 0;

    if (isValid) {
      const hashedPassword = helpers.hash(payload.password);

      if (!hashedPassword) {
        return cb(500, {error: `Couldn't hash user's password`});
      }

      const userObject = {
        firstName,
        lastName,
        password: hashedPassword,
        phone,
        tosAgreement,
      };

      try {
        // make sure user doesn't exist
        await dataLib.read('users', phone);

        cb(400, {error: 'User exists'});
        // if it errors, create the file
      } catch (err) {
        try {
          const permittedFields = ['firstName', 'lastName', 'phone'];
          const result = await dataLib.create(
            'users',
            phone as any,
            userObject
          );
          const permittedResponse = permittedFields
            .map(field => ({[field]: result[field]}))
            .reduce((acc, obj) => ({...acc, ...obj}), {});

          cb(201, permittedResponse);
        } catch (err) {
          cb(500, err);
        }
      }
    } else {
      cb(400, {error: `invalid fields: ${JSON.stringify(invalidFields)}`});
    }
  },

  patch: async ({pathname, payload}, cb) => {
    const [_, phone] = pathname.split('/');

    try {
      await dataLib.read('users', phone);

      try {
        const permittedFields = ['firstName', 'lastName', 'phone'];
        const permittedData = permittedFields
          .map(field => (payload[field] ? {[field]: payload[field]} : false))
          .filter(Boolean)
          .reduce((acc, obj) => ({...acc, ...obj}), {});
        const result = await dataLib.patch('users', phone, permittedData);
        const permittedResponse = permittedFields
          .map(field => ({[field]: result[field]}))
          .reduce((acc, obj) => ({...acc, ...obj}), {});

        cb(200, permittedResponse);
      } catch (err) {
        cb(500, err);
      }
    } catch (err) {
      cb(404, err);
    }
  },

  put: async ({pathname, payload}, cb) => {
    const [_, phone] = pathname.split('/');
    const permittedFields = ['firstName', 'lastName', 'phone'];

    try {
      const data = await dataLib.read('users', phone);

      try {
        const permittedData = permittedFields
          .map(field => ({[field]: payload[field]}))
          .reduce((acc, obj) => ({...acc, ...obj}), {});
        const result = await dataLib.update('users', phone, {
          ...data,
          ...permittedData,
        });
        const permittedResponse = permittedFields
          .map(field => ({[field]: result[field]}))
          .reduce((acc, obj) => ({...acc, ...obj}), {});

        cb(200, permittedResponse);
      } catch (err) {
        cb(500, err);
      }
    } catch (err) {
      cb(404, err);
    }
  },
};

const allowedMethods = ['get', 'patch', 'put', 'post', 'delete'];
const users = createServiceRouter(allowedMethods, userMethods);

export {users};
