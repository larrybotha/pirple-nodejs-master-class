import {config} from './config';
import {forms} from './forms';
import {requests} from './requests';

const app = {
  config,
  forms,
  requests,
};

// Call the init processes after the window loads
window.addEventListener('load', forms.bindForm);
