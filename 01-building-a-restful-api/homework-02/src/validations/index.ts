type ValidationError = string;

interface Validation {
  errors: ValidationError[];
  value?: any;
}

type CreateValidator = (v: any, name: string) => Validation[];
const createValidator: CreateValidator = (value, name) => [
  {value, name, errors: []},
];

type Validator<Options = any> = (
  options?: Options,
  msg?: string
) => (v: Validation) => Validation;

const exists: Validator = (
  msg = 'Missing required parameter'
) => validation => {
  const isValid = Boolean(validation.value);

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isOfType: Validator<{type: string}> = (
  {type},
  msg = `Value is not of type ${type}`
) => validation => {
  const isValid = typeof validation.value === type;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isInstanceOf: Validator<{instance: any}> = (
  {instance},
  msg = `Value is not of instance ${instance.toString()}`
) => validation => {
  const isValid = validation.value instanceof instance;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isOneOf: Validator<any[]> = (
  arr = [],
  msg = `Not one of ${arr.join(', ')}`
) => validation => {
  const isValid = arr.indexOf(validation.value) > -1;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const trim: Validator = () => validation => {
  return {...validation, value: validation.value.trim()};
};

const hasLength: Validator<{length: number}> = (
  {length = 0},
  msg = `Value is not of length ${length}`
) => validation => {
  const isValid = validation.value.length === length;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const hasMinLength: Validator<{length: number}> = (
  {length = 0},
  msg = `Value has length less than ${length}`
) => validation => {
  const isValid = validation.value.length >= length;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const hasMaxLength: Validator<{length: number}> = (
  {length = 0},
  msg = `Value has length greater than ${length}`
) => validation => {
  const isValid = validation.value.length <= length;

  return isValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

type HasErrors = (v: Validation) => boolean;
const hasErrors: HasErrors = validation => {
  return validation.errors.length > 0;
};

export {
  createValidator,
  exists,
  hasErrors,
  hasLength,
  hasMaxLength,
  hasMinLength,
  isOfType,
  isOneOf,
  trim,
  Validator,
  Validation,
};
