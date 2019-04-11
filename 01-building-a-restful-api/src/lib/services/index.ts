import {apiServices} from './api';
import {accountServices} from './account';
import {home} from './home';
import {checksServices} from './checks';
import {notFound} from './not-found';
import {ping} from './ping';
import {sessionServices} from './session';

const services = {
  '': home,
  ...apiServices,
  ...accountServices,
  ...sessionServices,
  ...checksServices,
  notFound,
  ping,
};

export default services;
