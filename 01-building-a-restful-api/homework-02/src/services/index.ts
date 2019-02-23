import {ping} from './ping';
import {notFound} from './not-found';

type Service = (a: any) => void;
const services = {
  ping,
  notFound,
};

export {services};
