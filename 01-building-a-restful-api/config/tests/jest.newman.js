const config = require('../../../config/jest.newman');

module.exports = {
  ...config,
  rootDir: '../../tests',
  testMatch: [`**/*.test.api.js`],
};
