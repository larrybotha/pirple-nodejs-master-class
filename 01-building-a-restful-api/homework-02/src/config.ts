import * as path from 'path';

const {STRIPE_API_KEY, MAILGUN_API_KEY} = process.env;

interface Config {
  http: {port: number};
  https: {
    port: number;
    sslCertPath: string;
    sslKeyPath: string;
  };
  apis: {
    mailGun: {apiKey: string};
    stripe: {apiKey: string};
  };
}
const config: Config = {
  apis: {
    mailGun: {apiKey: MAILGUN_API_KEY},
    stripe: {apiKey: STRIPE_API_KEY},
  },
  http: {port: 3000},
  https: {
    port: 3002,
    sslCertPath: path.join(__dirname, '../https/server.cert'),
    sslKeyPath: path.join(__dirname, '../https/server.key'),
  },
};

export {config};
