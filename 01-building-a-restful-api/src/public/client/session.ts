import {configs} from './config';
import {requests} from './requests';
import {Config} from './types/config';

// Get the session token from localstorage and set it in the config object
const performSessionSideEffects = () => {
  const tokenString = localStorage.getItem('token');

  if (typeof tokenString === 'string') {
    try {
      const token = JSON.parse(tokenString);

      configs.set('sessionToken', token);

      if (typeof token === 'object') {
        setLoggedInClass(true);
      } else {
        setLoggedInClass(false);
      }
    } catch (e) {
      configs.set('sessionToken', null);
      setLoggedInClass(false);
    }
  } else {
    setLoggedInClass(false);
  }
};

// Set (or remove) the loggedIn class from the body
const setLoggedInClass = (add: boolean) => {
  const {body} = document;

  if (add) {
    body.classList.add('loggedIn');
  } else {
    body.classList.remove('loggedIn');
  }
};

// Set the session token in the config object as well as localstorage
const setToken = (token?: Config['sessionToken']) => {
  const tokenString = JSON.stringify(token);

  localStorage.setItem('token', tokenString);

  performSessionSideEffects();
};

// Renew the token
const renewToken = (currentToken: Config['sessionToken']) => {
  return new Promise(async (resolve, reject) => {
    // Update the token with a new expiration
    const payload = {
      extend: true,
      id: currentToken.id,
    };

    try {
      const {statusCode, responsePayload} = await requests.makeRequest({
        method: 'PATCH',
        path: 'api/tokens',
        payload,
      });

      // Display an error on the form if needed
      if (/^2/.test(`${statusCode}`)) {
        setToken(responsePayload);
        resolve();
      } else {
        throw new Error(responsePayload);
      }
    } catch (err) {
      setToken();
      reject();
    }
  });
};

// Loop to renew token often
const startTokenRenewalLoop = () => {
  setInterval(async () => {
    const token = configs.get('sessionToken');

    if (token) {
      try {
        await renewToken(token);

        // tslint:disable-next-line
        console.log('Token renewed successfully @ ' + Date.now());
      } catch (err) {
        // tslint:disable-next-line
        console.log('unable to renew token', err);
      }
    }
  }, 1000 * 60);
};

const logoutHandler = async () => {
  const id = configs.get('id');

  try {
    await requests.makeRequest({
      path: '/api/tokens',
      method: 'DELETE',
      payload: {id},
    });

    window.location.replace('/sessions/delete');
  } catch (err) {
    alert(err);
  }
};

const bindLogoutHandler = () => {
  const logoutBtn = document.querySelector('.js-logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutHandler);
  }
};

const session = {
  bindLogoutHandler,
  performSessionSideEffects,
  renewToken,
  setToken,
  startTokenRenewalLoop,
};

export {session};
