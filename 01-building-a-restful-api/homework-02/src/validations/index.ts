type ValidationError = string;

interface Validation {
  name: string;
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

const confirmValid = (v: Validation): boolean => {
  return v.errors.length === 0;
};

const exists: Validator = (
  msg = 'Missing required parameter'
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && Boolean(validation.value);

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isOfType: Validator<{type: string}> = (
  {type},
  msg = `Value is not of type ${type}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && typeof validation.value === type;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isInstanceOf: Validator<{instance: any}> = (
  {instance},
  msg = `Value is not of instance ${instance.toString()}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && validation.value instanceof instance;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const isOneOf: Validator<any[]> = (
  arr = [],
  msg = `Not one of ${arr.join(', ')}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && arr.indexOf(validation.value) > -1;

  return isValid || !previouslyValid
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
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && validation.value.length === length;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const hasMinValue: Validator<number> = (
  value = 0,
  msg = `Value must be at least ${value}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && validation.value >= value;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const hasMinLength: Validator<{length: number}> = (
  {length = 0},
  msg = `Value has length less than ${length}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && validation.value.length >= length;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

const hasMaxLength: Validator<{length: number}> = (
  {length = 0},
  msg = `Value has length greater than ${length}`
) => validation => {
  const previouslyValid = confirmValid(validation);
  const isValid = previouslyValid && validation.value.length <= length;

  return isValid || !previouslyValid
    ? validation
    : {...validation, errors: validation.errors.concat(msg)};
};

type HasErrors = (v: Validation) => boolean;
const hasErrors: HasErrors = validation => validation.errors.length > 0;

export {
  createValidator,
  exists,
  hasErrors,
  hasLength,
  hasMaxLength,
  hasMinLength,
  hasMinValue,
  isOfType,
  isOneOf,
  trim,
  Validator,
  Validation,
};
