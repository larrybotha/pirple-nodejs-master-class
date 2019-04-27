import {Config} from './types/config';

const config: Config = {
  sessionToken: null,
};

const get = (propName: string) => config[propName];
const set = (propName: string, value: any) => (config[propName] = value);

const configs = {
  get,
  set,
};

export {configs};
