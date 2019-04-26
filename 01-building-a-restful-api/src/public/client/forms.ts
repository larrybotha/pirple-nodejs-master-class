import {client} from './client';

// Bind the forms
const bindForm = () => {
  document.querySelector('form').addEventListener('submit', async e => {
    // Stop it from submitting
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formId = form.id;
    const path = form.action;
    const method = form.method.toUpperCase();
    const formErrorEl = document.querySelector(
      `#${formId}.formError`
    ) as HTMLElement;

    // Hide the error message (if it's currently shown due to a previous error)
    formErrorEl.style.display = 'none';

    // Turn the inputs into a payload
    const elements = this.elements;
    const payload = elements
      .filter((elem: HTMLFormElement) => elem.type !== 'submit')
      .reduce((acc: object, elem: HTMLFormElement) => {
        const value = elem.type === 'checkbox' ? elem.checked : elem.value;

        return {...acc, [elem.name]: value};
      }, {});

    // Call the API
    try {
      const {statusCode, responsePayload} = await client.request({
        method,
        path,
        payload,
      });

      // Display an error on the form if needed
      if (statusCode !== 200) {
        // Try to get the error from the api, or set a default error message
        const error =
          typeof responsePayload.Error === 'string'
            ? responsePayload.Error
            : 'An error has occured, please try again';

        // Set the formError field with the error text
        document.querySelector('#' + formId + ' .formError').innerHTML = error;

        // Show (unhide) the form error field on the form
        formErrorEl.style.display = 'inherit';
      } else {
        // If successful, send to form response processor
        responseProcessor(formId, payload, responsePayload);
      }
    } catch (err) {
      formErrorEl.style.display = 'inherit';
      responseProcessor(formId, payload, err);
    }
  });
};

// Form response processor
const responseProcessor = (
  formId: string,
  requestPayload: any,
  responsePayload: any
) => {
  const functionToCall = false;

  if (formId === 'accountCreate') {
    // @TODO Do something here now that the account has been created successfully
  }
};

const forms = {
  bindForm,
  responseProcessor,
};

export {forms};
