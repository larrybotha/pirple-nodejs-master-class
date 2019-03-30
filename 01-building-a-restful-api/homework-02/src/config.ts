import * as path from 'path';

const {
  MAILGUN_API_KEY,
  MAILGUN_SECRET_KEY,
  STRIPE_API_KEY,
  STRIPE_SECRET_KEY,
} = process.env;

interface Config {
  apis: {
    mailGun: {
      apiKey: string;
      secretKey: string;
    };
    stripe: {
      apiKey: string;
      secretKey: string;
    };
  };
  hashingSecret: string;
  http: {port: number};
  https: {
    port: number;
    sslCertPath: string;
    sslKeyPath: string;
  };
}

const config: Config = {
  apis: {
    mailGun: {
      apiKey: MAILGUN_API_KEY,
      secretKey: MAILGUN_SECRET_KEY,
    },
    stripe: {
      apiKey: STRIPE_API_KEY,
      secretKey: STRIPE_SECRET_KEY,
    },
  },
  hashingSecret: 'hashing-secret',
  http: {port: 3000},
  https: {
    port: 3002,
    sslCertPath: path.join(__dirname, '../https/server.cert'),
    sslKeyPath: path.join(__dirname, '../https/server.key'),
  },
};

export {config};
