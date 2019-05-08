import {configs} from './config';
import {requests} from './requests';
import {session} from './session';

// Load the account edit page specifically
const loadAccountEditPage = async () => {
  // Get the phone number from the current token, or log the user out if none is there
  const token = configs.get('sessionToken');

  if (token) {
    try {
      const result = await requests.makeRequest({
        method: 'GET',
        path: `api/users/${token.phone}`,
        headers: [
          {name: 'phone', value: token.phone},
          {name: 'token', value: token.id},
        ],
      });
      const fnInput = document.querySelector(
        '#accountEdit1 .firstNameInput'
      ) as HTMLInputElement;
      const lnInput = document.querySelector(
        '#accountEdit1 .lastNameInput'
      ) as HTMLInputElement;
      const phoneInput = document.querySelector(
        '#accountEdit1 .displayPhoneInput'
      ) as HTMLInputElement;

      fnInput.value = result.firstName;
      lnInput.value = result.lastName;
      phoneInput.value = result.phone;

      // Put the hidden phone field into both forms
      const hiddenPhoneInputs = document.querySelectorAll(
        'input.hiddenPhoneNumberInput'
      );

      [].slice
        .call(hiddenPhoneInputs)
        .map((el: HTMLInputElement) => (el.value = result.phone));
    } catch (err) {
      session.logout();
    }
  } else {
    session.logout();
  }
};

export {loadAccountEditPage};
