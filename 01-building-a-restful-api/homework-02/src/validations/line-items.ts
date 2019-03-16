import {OrderLineItem} from '../types/entities/orders';

import {createValidator, Validation, Validator} from './index';

const validateIdExists: Validator = () => validation => {
  const {id} = validation.value;

  return Boolean(id)
    ? validation
    : {
        ...validation,
        errors: validation.errors.concat('line item requires and id'),
      };
};

const validateMinQuantity: Validator = () => validation => {
  const {quantity} = validation.value;

  return quantity && quantity > 0
    ? validation
    : {
        ...validation,
        errors: validation.errors.concat(
          'line item requires a quantity greater than 0'
        ),
      };
};

type ValidateLineItem = (lineItem: Partial<OrderLineItem>) => Validation;
const validateLineItem: ValidateLineItem = lineItem => {
  const name = 'line-item';

  return createValidator(lineItem, name)
    .map(validateIdExists())
    .map(validateMinQuantity())
    .find(Boolean);
};

type ValidateLineItems = (
  lineItems: Array<Partial<OrderLineItem>>
) => Validation[];
const validateLineItems: ValidateLineItems = lineItems => {
  return lineItems.map(validateLineItem);
};

export {validateLineItems};
