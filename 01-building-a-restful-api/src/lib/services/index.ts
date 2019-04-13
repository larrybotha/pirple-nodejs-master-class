import {accountServices} from './account';
import {apiServices} from './api/index';
import {checksServices} from './checks';
import {home} from './home';
import {notFound} from './not-found';
import {ping} from './ping';
import {sessionServices} from './session';

const services = {
  ...apiServices,
  ...accountServices,
  ...sessionServices,
  ...checksServices,
  home,
  notFound,
  ping,
};

export default services;
