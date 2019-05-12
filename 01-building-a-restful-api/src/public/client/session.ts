import {configs} from './config';
import {requests} from './requests';
import {SessionToken} from './types/config';

// Get the session token from localstorage and set it in the config object
const performSessionSideEffects = () => {
  const token = JSON.parse(localStorage.getItem('token'));

  if (token) {
    configs.set('sessionToken', token);
    setLoggedInClass(true);
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
const setToken = (token?: SessionToken) => {
  if (token) {
    localStorage.setItem('token', JSON.stringify(token));
  } else {
    localStorage.removeItem('token');
  }

  performSessionSideEffects();
};

// Renew the token
const renewToken = (currentToken: SessionToken) => {
  return new Promise(async (resolve, reject) => {
    // Update the token with a new expiration
    const payload = {extend: true};

    try {
      const result = await requests.makeRequest({
        headers: [
          {name: 'phone', value: currentToken.phone},
          {name: 'token', value: currentToken.id},
        ],
        method: 'PUT',
        path: 'api/tokens',
        payload,
      });

      setToken(result);
      resolve();
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

const logout = async () => {
  const token = configs.get('sessionToken');

  try {
    await requests.makeRequest({
      headers: [
        {name: 'token', value: token.id},
        {name: 'phone', value: token.phone},
      ],
      method: 'DELETE',
      path: `/api/tokens`,
    });

    setToken();
    window.location.replace('/sessions/delete');
    performSessionSideEffects();
  } catch (err) {
    alert(err);
  }
};

const bindLogoutHandler = () => {
  const logoutBtn = document.querySelector('.js-logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
};

const session = {
  bindLogoutHandler,
  logout,
  performSessionSideEffects,
  renewToken,
  setToken,
  startTokenRenewalLoop,
};

export {session};
