import {accountServices} from './account';
import {apiServices} from './api/index';
import {checksServices} from './checks';
import {faviconService} from './favicon';
import {home} from './home';
import {notFound} from './not-found';
import {ping} from './ping';
import {sessionServices} from './session';

const services = {
  ...apiServices,
  // ...accountServices,
  // ...sessionServices,
  // ...checksServices,
  'favicon.ico': faviconService,
  home,
  notFound,
  ping,
};

export default services;
