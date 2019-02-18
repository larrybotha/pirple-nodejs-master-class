const {STRIPE_API_KEY, MAILGUN_API_KEY} = process.env;

interface Config {
  http: {
    port: number;
  };
  https: {
    port: number;
  };
  apis: {
    stripe: {
      apiKey: string;
    };
    mailGun: {
      apiKey: string;
    };
  };
}
const config: Config = {
  http: {port: 3000},
  https: {port: 3002},
  apis: {
    mailGun: {
      apiKey: MAILGUN_API_KEY,
    },
    stripe: {
      apiKey: STRIPE_API_KEY,
    },
  },
};

export {config};
