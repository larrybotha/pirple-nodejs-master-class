import {configs} from './config';
import {requests} from './requests';
import {session} from './session';

// Bind the forms
const bindForms = () => {
  const formEls = document.querySelectorAll('form');

  if (formEls) {
    [].slice.call(formEls).map((formEl: HTMLFontElement) => {
      formEl.addEventListener('submit', async e => {
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
        const token = configs.get('SessionToken');
        const headers = token
          ? [
              {
                name: 'phone',
                value: token.phone,
              },
              {
                name: 'token',
                value: token.id,
              },
            ]
          : [];

        // Call the API
        try {
          const result = await requests.makeRequest({
            headers,
            method,
            path,
            payload,
          });

          responseProcessor({id, payload, responsePayload: result});
        } catch (err) {
          formErrorEl.style.display = 'inherit';
          formErrorEl.innerHTML = JSON.stringify(err, null, 2);
          // responseProcessor({id, payload, responsePayload: err});
        }
      });
    });
  }
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
}) => {
  const newPayload = {
    password: payload.password,
    phone: payload.phone,
  };
  const form = document.querySelector(`#${id}`) as HTMLFormElement;
  const formErrorEl = form.querySelector('.formError') as HTMLElement;

  try {
    const result = await requests.makeRequest({
      method: 'POST',
      path: 'api/tokens',
      payload: newPayload,
    });

    session.setToken(result);
    window.location.replace('/checks/all');
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
  accountCreate: handleSuccessfulAccountCreation,
  sessionCreate: handleSuccessfulTokenCreation,
};

// Form response processor
const responseProcessor: ResponseProcessor = options => {
  const {id} = options;
  const fn = responseSuccessMap[id];

  if (fn) {
    fn(options);
  }
};

const forms = {
  bindForms,
  responseProcessor,
};

export {forms};
