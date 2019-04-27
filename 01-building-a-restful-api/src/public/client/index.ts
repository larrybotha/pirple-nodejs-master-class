import {configs} from './config';
import {forms} from './forms';
import {requests} from './requests';
import {session} from './session';

const app = {
  configs,
  forms,
  requests,
  session,
};

// Call the init processes after the window loads
window.addEventListener('load', () => {
  forms.bindForms();

  session.performSessionSideEffects();

  session.startTokenRenewalLoop();
});
