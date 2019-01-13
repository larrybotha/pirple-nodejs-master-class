import {equals, exists, isOfType, minLength, trim} from '../../validate';

const validateFirstName = (firstName: string) =>
  [firstName]
    .map(exists('First name is required'))
    .map(isOfType('Must be a string', {types: ['string']}))
    .map(trim())
    .find(Boolean);

const validateLastName = (lastName: string) =>
  [lastName]
    .map(exists('Last name is required'))
    .map(isOfType('Must be a string', {types: ['string']}))
    .map(trim())
    .find(Boolean);

const validatePhone = (phone: string) =>
  [phone]
    .map(exists('Phone is required'))
    .map(isOfType('Must be a string', {types: ['string']}))
    .map(minLength('Phone must be at least 10 chars', {length: 10}))
    .map(trim())
    .find(Boolean);

const validatePassword = (password: string) =>
  [password]
    .map(exists('Password is required'))
    .map(isOfType('Must be a string', {types: ['string']}))
    .map(minLength('Password must be at least 8 chars', {length: 8}))
    .map(trim())
    .find(Boolean);

const validateTos = (tos: string) =>
  [tos]
    .map(exists('TOS is required'))
    .map(equals('TOS must be true', {value: 'true'}))
    .find(Boolean);

export {
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateTos,
};
