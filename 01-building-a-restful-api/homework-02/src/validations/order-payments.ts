import {createValidator, exists, hasMinValue, Validation} from './index';

type ValidateAmount = (value: number) => Validation;
const validateAmount: ValidateAmount = n => {
  const name = 'amount';

  return createValidator(n, name)
    .map(exists(`${name} is required`))
    .map(hasMinValue(1, `${name} must be at least 1`))
    .find(Boolean);
};

export {validateAmount};
