import {accountsService} from './accounts';
import {checksService} from './checks';
import {faviconService} from './favicon';
import {home} from './home';
import {sessionsService} from './sessions';
import {staticAssetsService} from './static-assets';

const viewServices = {
  ...accountsService,
  ...sessionsService,
  ...checksService,
  'favicon.ico': faviconService,
  home,
  'public/:asset': staticAssetsService,
};

export {viewServices};
