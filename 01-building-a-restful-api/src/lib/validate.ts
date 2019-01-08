type Valid = any;
interface Invalid {
  error: string;
}

type Validator<O = {[key: string]: any}, T = Valid | Invalid> = (
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
  const validateType = (v: Valid) =>
    types.indexOf(v) >= -1 ? v : {error: msg};

  return isError(val) ? val : validateType(val);
};

const minLength: Validator<{length: number}> = (
  msg = 'This value is not long enough',
  {length = 0}
) => val => {
  console.log(`================length ${val}`);

  const validateMinLength = (v: Valid) =>
    v.length >= length ? v : {error: msg};

  return isError(val) ? val : validateMinLength(val);
};

export {exists, isOfType, minLength, trim};
