import {create} from './create';
import {deleteSession} from './delete';

const sessionsService = {
  'sessions/create': create,
  'sessions/delete': deleteSession,
};

export {sessionsService};
