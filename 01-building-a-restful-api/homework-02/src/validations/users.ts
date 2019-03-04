import {
  createValidator,
  exists,
  hasMinLength,
  Validation,
  Validator,
} from './index';

type ValidatePassword = (value: string) => Validation;
const validatePassword: ValidatePassword = value => {
  const name = 'password';
  const length = 8;

  return createValidator(value, name)
    .map(exists(`${name} is required`))
    .map(
      hasMinLength(
        {length},
        `${name} must be at least ${length} characters long`
      )
    )
    .find(Boolean);
};

type ValidateEmail = (value: string) => Validation;
const validateEmail: ValidateEmail = value => {
  const name = 'email';

  return createValidator(value, name)
    .map(exists(`${name} is required`))
    .find(Boolean);
};

export {validateEmail, validatePassword};
