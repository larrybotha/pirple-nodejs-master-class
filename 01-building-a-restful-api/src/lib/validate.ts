export type Valid = any;
export interface Invalid {
  error: string;
}

export type Validator<O = {[key: string]: any}, T = Valid | Invalid> = (
  msg?: string,
  options?: O
) => (val: Valid | Invalid) => T extends Invalid ? Invalid[] : Valid | Invalid;

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

const isOfType: Validator<{types: string[]}> = (
  msg = 'Value is incorrect type',
  {types = []}
) => val => {
  const type = typeof val;
  const validateType = (v: Valid) =>
    types.indexOf(type) >= -1 ? v : {error: msg};

  return isError(val) ? val : validateType(val);
};

const minLength: Validator<{length: number}> = (
  msg = 'This value is not long enough',
  {length = 0}
) => val => {
  const validateMinLength = (v: Valid) =>
    v.length >= length ? v : {error: msg};

  return isError(val) ? val : validateMinLength(val);
};

const equals: Validator<{value: any}> = (
  msg = 'This value is incorrect',
  {value = null}
) => val => {
  const validateEqual = (v: Valid) => (v === value ? v : {error: msg});

  return isError(val) ? val : validateEqual(val);
};

export {equals, exists, isOfType, minLength, trim};
