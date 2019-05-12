import {forms} from './forms';
import {loadDataOnPage} from './load';
import {session} from './session';

// Call the init processes after the window loads
window.addEventListener('load', () => {
  forms.bindForms();

  session.performSessionSideEffects();

  session.startTokenRenewalLoop();
  session.bindLogoutHandler();
  loadDataOnPage();
});
