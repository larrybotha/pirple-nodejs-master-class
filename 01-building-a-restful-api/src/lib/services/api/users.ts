import dataLib from '../../data';
import helpers from '../../helpers';
import {Handler} from '../../types';
import {User} from '../../types/services/users';

import {createServiceRouter} from '../utils/index';
import {verifyToken} from '../utils/verify-token';
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateTos,
} from '../validations/users';

interface UserMethods {
  delete: Handler;
  get: Handler;
  patch: Handler<Partial<User> & {[key: string]: any}>;
  post: Handler<User>;
  put: Handler;
  [key: string]: any;
}

const getPhoneFromPath = (path: string): string => {
  const parts = path.split('/');

  return parts.length === 3 ? parts.slice(-1).find(Boolean) : '';
};

const userMethods: UserMethods = {
  delete: async ({headers, pathname}, cb) => {
    const {code, msg, token, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const phone = getPhoneFromPath(pathname);

    if (token.phone !== phone) {
      return cb(403, {error: 'Not authorised'});
    }

    try {
      const userData: User = await dataLib.read('users', phone);

      if (userData.checks) {
        try {
          await Promise.all(
            userData.checks.map((checkId: string) =>
              dataLib.delete('checks', checkId)
            )
          );
        } catch (err) {
          return cb(500, {error: err});
        }
      }

      await dataLib.delete('users', phone);

      cb(200);
    } catch (err) {
      cb(204, {error: err});
    }
  },

  get: async ({headers, pathname}, cb) => {
    const {code, msg, token, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const phone = getPhoneFromPath(pathname);

    if (token.phone !== phone) {
      return cb(403, {error: 'Not authorised'});
    }

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

      const userObject: User = {
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

  patch: async ({headers, pathname, payload}, cb) => {
    const {code, msg, token, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const phone = getPhoneFromPath(pathname);

    if (token.phone !== phone) {
      return cb(403, {error: 'Not authorised'});
    }

    try {
      await dataLib.read('users', phone);

      try {
        const permittedFields = ['firstName', 'lastName', 'phone'];
        const permittedData = permittedFields
          .map((field: any) => {
            const val = payload[field];

            return val ? {[field]: val} : false;
          })
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

  put: async ({headers, pathname, payload}, cb) => {
    const {code, msg, token, verified} = await verifyToken(headers);

    if (!verified) {
      return cb(code, {error: msg});
    }

    const phone = getPhoneFromPath(pathname);

    if (token.phone !== phone) {
      return cb(403, {error: 'Not authorised'});
    }

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
