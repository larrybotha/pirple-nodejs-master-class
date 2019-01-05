interface Environment {
  envName: string;
  httpPort: number;
  httpsPort: number;
}

const development: Environment = {
  envName: 'development',
  httpPort: 3000,
  httpsPort: 3001,
};

const production: Environment = {
  envName: 'production',
  httpPort: 5000,
  httpsPort: 5001,
};

const environments: {[key: string]: Environment} = {
  development,
  production,
};

const environment = environments[process.env.NODE_ENV] || environments.development;

export default environment
