import {requests} from './requests';
import {session} from './session';

// Bind the forms
const bindForms = () => {
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

      responseProcessor({id, payload, responsePayload});
    } catch (err) {
      formErrorEl.style.display = 'inherit';
      formErrorEl.innerHTML = JSON.stringify(err, null, 2);
      responseProcessor({id, payload, responsePayload: err});
    }
  });
};

interface ResponseProcessorParams {
  id: string;
  payload: any;
  responsePayload: any;
}
type ResponseProcessor = (options: ResponseProcessorParams) => void;

const handleSuccessfulAccountCreation: ResponseProcessor = async ({
  id,
  payload,
  responsePayload,
}) => {
  const newPayload = {
    password: payload.password,
    phone: payload.phone,
  };
  const form = document.querySelector(`#${id}`) as HTMLFormElement;
  const formErrorEl = form.querySelector('.formError') as HTMLElement;

  try {
    const {
      statusCode,
      responsePayload: newResponsePayload,
    } = await requests.makeRequest({
      method: 'POST',
      path: 'api/tokens',
      payload: newPayload,
    });

    if (/^2/.test(`${statusCode}`)) {
      // If successful, set the token and redirect the user
      session.setToken(newResponsePayload);
      window.location.replace('/checks/all');
    } else {
      formErrorEl.innerHTML = 'Sorry, an error has occured. Please try again.';
      formErrorEl.style.display = 'block';
    }
  } catch (err) {
    formErrorEl.innerHTML = 'Sorry, an error has occured. Please try again.';
    formErrorEl.style.display = 'block';
  }
};

const handleSuccessfulTokenCreation: ResponseProcessor = ({
  responsePayload,
}) => {
  session.setToken(responsePayload);
  window.location.replace('/checks/all');
};

interface ResponseMap {
  [key: string]: ResponseProcessor;
}
const responseSuccessMap: ResponseMap = {
  'api/tokens': handleSuccessfulTokenCreation,
  'api/users': handleSuccessfulAccountCreation,
};

// Form response processor
const responseProcessor: ResponseProcessor = options => {
  const {payload} = options;
  const fn = responseSuccessMap[payload.path];

  if (fn) {
    fn(options);
  }
};

const forms = {
  bindForms,
  responseProcessor,
};

export {forms};
