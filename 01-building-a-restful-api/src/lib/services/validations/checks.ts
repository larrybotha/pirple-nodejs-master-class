import {
  exists,
  hasLength,
  Invalid,
  isInstanceOf,
  isOfType,
  minLength,
  oneOf,
  trim,
  Valid,
  Validator,
} from '../../validations';

const checksAllowedProtocols = ['https', 'http'];
const checksAllowedMethods = ['get', 'put', 'post', 'delete'];

const validateProtocol = (protocol?: string) =>
  [protocol]
    .map(exists('protocol is required'))
    .map(
      oneOf(
        checksAllowedProtocols,
        `protocol must be one of ${checksAllowedProtocols.join(', ')}`
      )
    )
    .find(Boolean);

const validateUrl = (url?: string) =>
  [url]
    .map(exists('url is required'))
    .map(trim())
    .find(Boolean);

const validateMethod = (method?: string) =>
  [method]
    .map(exists('method is required'))
    .map(
      oneOf(
        checksAllowedMethods,
        `method must be one of ${checksAllowedMethods.join(',')}`
      )
    )
    .find(Boolean);

const validateSuccessCodes = (xs?: number[]) =>
  [xs]
    .map(exists('successCodes is required'))
    .map(isInstanceOf(Array, 'Must be an array'))
    .map(minLength(1, 'successCodes must have min length of 1'))
    .find(Boolean);

const validateTimeoutSeconds = (n?: number) =>
  [n]
    .map(exists('timeoutSeconds is required'))
    .map(isOfType(['number'], 'Must be a number'))
    .find(Boolean);

const validateId = (str?: string) =>
  [str]
    .map(exists('id is required'))
    .map(hasLength(20, 'id must be 20 characters long'))
    .find(Boolean);

export {
  validateMethod,
  validateProtocol,
  validateSuccessCodes,
  validateTimeoutSeconds,
  validateUrl,
};
