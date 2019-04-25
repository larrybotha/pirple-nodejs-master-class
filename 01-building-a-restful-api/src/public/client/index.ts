import {config} from './config';
import {client} from './client';
import {forms} from './forms';

const app = {
  client,
  config,
  forms,
};

const requestPing = async () => {
  try {
    const result = await app.client.request({path: '/ping', method: 'GET'});
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

requestPing();

// Call the init processes after the window loads
window.addEventListener('load', forms.bind);
