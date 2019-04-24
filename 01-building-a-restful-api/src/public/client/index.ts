import {config} from './config';
import {client} from './client';

const app = {
  client,
  config,
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
