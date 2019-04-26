import {accountServices} from './accounts';
import {checksServices} from './checks';
import {faviconService} from './favicon';
import {home} from './home';
import {sessionServices} from './session';
import {staticAssetsService} from './static-assets';

const viewServices = {
  ...accountServices,
  // ...sessionServices,
  // ...checksServices,
  'favicon.ico': faviconService,
  home,
  'public/:asset': staticAssetsService,
};

export {viewServices};
