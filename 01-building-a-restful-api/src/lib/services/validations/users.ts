import {equals, exists, isOfType, minLength, trim} from '../../validations';

const validateFirstName = (firstName: string) =>
  [firstName]
    .map(exists('First name is required'))
    .map(isOfType(['string'], 'Must be a string'))
    .map(trim())
    .find(Boolean);

const validateLastName = (lastName: string) =>
  [lastName]
    .map(exists('Last name is required'))
    .map(isOfType(['string'], 'Must be a string'))
    .map(trim())
    .find(Boolean);

const validatePhone = (phone: string) =>
  [phone]
    .map(exists('Phone is required'))
    .map(isOfType(['string'], 'Must be a string'))
    .map(minLength(10, 'Phone must be at least 10 chars'))
    .map(trim())
    .find(Boolean);

const validatePassword = (password: string) =>
  [password]
    .map(exists('Password is required'))
    .map(isOfType(['string'], 'Must be a string'))
    .map(minLength(8, 'Password must be at least 8 chars'))
    .map(trim())
    .find(Boolean);

const validateTos = (tos: string | boolean) =>
  [tos]
    .map(exists('TOS is required'))
    .map(equals('true', 'TOS must be true'))
    .find(Boolean);

export {
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateTos,
};
