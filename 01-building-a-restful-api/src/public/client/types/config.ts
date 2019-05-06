interface SessionToken {
  expires: number;
  id: string;
  phone: string;
}

interface Config {
  sessionToken: null | SessionToken;
  [key: string]: any;
}

export {Config, SessionToken};
