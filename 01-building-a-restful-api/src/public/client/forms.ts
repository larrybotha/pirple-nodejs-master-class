import {requests} from './requests';

// Bind the forms
const bindForm = () => {
  document.querySelector('form').addEventListener('submit', async e => {
    // Stop it from submitting
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const {action: path, elements, id, method: m} = form;
    const method = m.toUpperCase();
    const formErrorEl = form.querySelector('.formError') as HTMLElement;

    // Hide the error message (if it's currently shown due to a previous error)
    formErrorEl.style.display = 'none';

    // Turn the inputs into a payload
    const payload = [...elements]
      .filter((elem: HTMLFormElement) => elem.type !== 'submit')
      .reduce((acc: object, elem: HTMLFormElement) => {
        const value = elem.type === 'checkbox' ? elem.checked : elem.value;

        return {...acc, [elem.name]: value};
      }, {});

    // Call the API
    try {
      const {statusCode, responsePayload} = await requests.makeRequest({
        method,
        path,
        payload,
      });

      responseProcessor(id, payload, responsePayload);
    } catch (err) {
      formErrorEl.style.display = 'inherit';
      formErrorEl.innerHTML = JSON.stringify(err, null, 2);
      responseProcessor(id, payload, err);
    }
  });
};

// Form response processor
const responseProcessor = (
  id: string,
  requestPayload: any,
  responsePayload: any
) => {
  const functionToCall = false;

  if (id === 'accountCreate') {
    // @TODO Do something here now that the account has been created successfully
  }
};

const forms = {
  bindForm,
  responseProcessor,
};

export {forms};
