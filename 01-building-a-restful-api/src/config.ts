/**
 * create and export environment variables
 */

interface Environment {
  envName: string;
  hashingSecret: string;
  httpPort: number;
  httpsPort: number;

  services: {
    checks: {maxChecks: number};
  };

  apis: {
    twilio: {
      sid: string;
      token: string;
    };
  };
}

const staging: Environment = {
  envName: 'staging',
  hashingSecret: 'dev-secret',
  httpPort: 3000,
  httpsPort: 3001,

  services: {
    checks: {maxChecks: 5},
  },

  apis: {
    twilio: {
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
    },
  },
};
const production: Environment = {
  envName: 'production',
  hashingSecret: 'prod-secret',
  httpPort: 5000,
  httpsPort: 5001,

  services: {
    checks: {maxChecks: 5},
  },

  apis: {
    twilio: {
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
    },
  },
};

const environments: {[key: string]: Environment} = {
  production,
  staging,
};

const env =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

export default (typeof environments[env] === 'object'
  ? environments[env]
  : environments.staging);
