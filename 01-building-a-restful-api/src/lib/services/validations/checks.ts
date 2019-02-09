import {
  exists,
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
        `protocol must be one of ${checksAllowedProtocols.join(', ')}`,
        checksAllowedProtocols
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
        `method must be one of ${checksAllowedMethods.join(',')}`,
        checksAllowedMethods
      )
    )
    .find(Boolean);

const validateSuccessCodes = (xs?: number[]) =>
  [xs]
    .map(exists('successCodes is required'))
    .map(isInstanceOf('Must be an array', Array))
    .map(minLength('successCodes must have min length of 1', {length: 1}))
    .find(Boolean);

const validateTimeoutSeconds = (n?: number) =>
  [n]
    .map(exists('timeoutSeconds is required'))
    .map(isOfType('Must be a number', {types: ['number']}))
    .find(Boolean);

export {
  validateMethod,
  validateProtocol,
  validateSuccessCodes,
  validateTimeoutSeconds,
  validateUrl,
};
