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

interface UserMethods {
  delete: Handler;
  get: Handler;
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
        const parsedData: {[key: string]: any} = helpers.parseJsonToObject(
          data
        );
        // don't return entire model
        // This is a blacklist, but a whitelist could just as easily be used
        const protectedFields = ['hashedPassword', 'tosAgreement'];
        const protectedData = Object.keys(parsedData)
          .filter(key => protectedFields.indexOf(key) === -1)
          .reduce((acc, key) => ({...acc, [key]: parsedData[key]}), {});

        cb(200, protectedData);
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
        // make sure user doens't exist
        await dataLib.read('users', phone);

        cb(400, {error: 'User exists'});
        // if it errors, create the file
      } catch (err) {
        try {
          const {
            password: privatePassword,
            ...responseObject
          } = await dataLib.create('users', phone as any, userObject);

          cb(201, responseObject);
        } catch (err) {
          cb(500, err);
        }
      }
    } else {
      cb(400, {error: `invalid fields: ${JSON.stringify(invalidFields)}`});
    }
  },

  put: async ({pathname, payload}, cb) => {
    const [_, phone] = pathname.split('/');
    const permittedFields = ['firstName', 'lastName', 'phone'];

    try {
      const data = await dataLib.read('users', phone);

      try {
        const parsedData: {[key: string]: any} = helpers.parseJsonToObject(
          data
        );
        // don't allow just any data to be submitted
        // This data should be validated, too
        const permittedData = Object.keys(payload)
          .filter(k => permittedFields.indexOf(k) > -1)
          .reduce((acc, key) => ({...acc, [key]: payload[key]}), {});
        const {
          password: privatePassword,
          ...responseData
        } = await dataLib.update('users', phone, {
          ...parsedData,
          ...permittedData,
        });

        cb(200, responseData);
      } catch (err) {
        cb(500, err);
      }
    } catch (err) {
      cb(404, err);
    }
  },
};

const allowedMethods = ['get', 'put', 'post', 'delete'];
const users = createServiceRouter(allowedMethods, userMethods);

export {users};
