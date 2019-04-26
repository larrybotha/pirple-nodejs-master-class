import {client} from './client';
import {config} from './config';
import {forms} from './forms';

const app = {
  client,
  config,
  forms,
};

// Call the init processes after the window loads
window.addEventListener('load', forms.bindForm);
