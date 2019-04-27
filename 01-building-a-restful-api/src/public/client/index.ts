import {requests} from './requests';
import {config} from './config';
import {forms} from './forms';

const app = {
  requests,
  config,
  forms,
};

// Call the init processes after the window loads
window.addEventListener('load', forms.bindForm);
