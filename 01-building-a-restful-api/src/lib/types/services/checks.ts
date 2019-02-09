import {User} from './users';

enum CheckState {
  Up = 'up',
  Down = 'down',
}

interface Check {
  id: string;
  lastChecked?: Date;
  method: string;
  phone: User['phone'];
  protocol: string;
  state?: CheckState;
  successCodes: number[];
  timeoutSeconds: number;
  url: string;
}

export {Check, CheckState};
