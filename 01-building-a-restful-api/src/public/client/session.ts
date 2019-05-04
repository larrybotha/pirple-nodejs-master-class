import {configs} from './config';
import {requests} from './requests';
import {Config} from './types/config';

// Get the session token from localstorage and set it in the config object
const performSessionSideEffects = () => {
  const tokenId = localStorage.getItem('tokenId');

  if (tokenId) {
    configs.set('sessionToken', tokenId);
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
const setToken = (tokenId?: string) => {
  localStorage.setItem('tokenId', tokenId);

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
      const result = await requests.makeRequest({
        method: 'PATCH',
        path: 'api/tokens',
        payload,
      });

      setToken(result.id);
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

const logoutHandler = async () => {
  const id = configs.get('sessionToken');

  try {
    await requests.makeRequest({
      method: 'DELETE',
      path: `/api/tokens/${id}`,
      headers: [{name: 'token', value: id}],
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
