import {
  createValidator,
  exists,
  hasMinLength,
  Validator,
  Validation,
} from './index';

type ValidatePassword = (value: string) => Validation[];
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
    );
};

type ValidateEmail = (value: string) => Validation[];
const validateEmail: ValidateEmail = value => {
  const name = 'email';

  return createValidator(value, name).map(exists(`${name} is required`));
};

export {validateEmail, validatePassword};
