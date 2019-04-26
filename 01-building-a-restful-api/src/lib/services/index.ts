import {apiServices} from './api/index';
import {notFound} from './not-found';
import {ping} from './ping';
import {viewServices} from './views/index';

const services = {
  ...apiServices,
  ...viewServices,
  notFound,
  ping,
};

export default services;
