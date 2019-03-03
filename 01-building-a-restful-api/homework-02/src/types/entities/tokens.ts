import {User} from './users';

interface Token {
  expires: number;
  id: string;
  userId: User['id'];
}

export {Token};
