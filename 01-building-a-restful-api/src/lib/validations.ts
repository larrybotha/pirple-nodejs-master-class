export type Valid = any;
export interface Invalid {
  error: string;
}

export type Validator<Options = any, Result = Valid | Invalid> = (
  options?: Options,
  msg?: string
) => (
  val: Valid | Invalid
) => Result extends Invalid ? Invalid[] : Valid | Invalid;

type ValidateMap = (fn: Validator) => [Valid | Invalid];

const isError = (v: any) => Boolean(v) && Boolean(v.error);

const exists: Validator = (msg = 'This value is required') => val => {
  const validateExists = (v: Valid): Valid | Invalid =>
    typeof v !== 'undefined' && v !== null ? v : {error: msg};
  const trimValue = (v: Valid): Valid => (typeof v === 'string' ? v.trim() : v);

  const result = isError(val) ? val : validateExists(val);

  return result;
};

const trim: Validator = () => val => {
  const trimValue = (v: Valid): Valid => (typeof v === 'string' ? v.trim() : v);

  return isError(val) ? val : trimValue(val);
};

const oneOf: Validator<any[]> = (options, msg = 'Does not match') => val => {
  const validateIsOneOf = (v: Valid) =>
    options.indexOf(v) >= -1 ? v : {error: msg};

  return isError(val) ? val : validateIsOneOf(val);
};

const isOfType: Validator<string[]> = (
  types = [],
  msg = 'Value is incorrect type'
) => val => {
  const type = typeof val;
  const validateType = (v: Valid) =>
    types.indexOf(type) >= -1 ? v : {error: msg};

  return isError(val) ? val : validateType(val);
};

const isInstanceOf: Validator<any> = (
  instance,
  msg = 'Value is incorrect instance'
) => val => {
  const validateInstance = (v: Valid) =>
    v instanceof instance ? v : {error: msg};

  return isError(val) ? val : validateInstance(val);
};

const maxLength: Validator<number> = (
  length = 0,
  msg = `This value is greater than ${length} characters long`
) => val => {
  const validateMaxLength = (v: Valid) =>
    v.length <= length ? v : {error: msg};

  return isError(val) ? val : validateMaxLength(val);
};

const minLength: Validator<number> = (
  length = 0,
  msg = `This value is not at least ${length} characters long`
) => val => {
  const validateMinLength = (v: Valid) =>
    v.length >= length ? v : {error: msg};

  return isError(val) ? val : validateMinLength(val);
};

const hasLength: Validator<number> = (
  length = 0,
  msg = `This value is not of length ${length}`
) => val => {
  const validateMinLength = (v: Valid) =>
    v.length >= length ? v : {error: msg};

  return isError(val) ? val : validateMinLength(val);
};

const equals: Validator<any> = (
  value = null,
  msg = 'This value is incorrect'
) => val => {
  const validateEqual = (v: Valid) => (v === value ? v : {error: msg});

  return isError(val) ? val : validateEqual(val);
};

export {
  equals,
  exists,
  hasLength,
  isInstanceOf,
  isOfType,
  maxLength,
  minLength,
  oneOf,
  trim,
};
