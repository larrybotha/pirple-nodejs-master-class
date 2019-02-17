const tslintProject = require('../config/jest.tslint');
const tscProject = require('../config/jest.tsc');

module.exports = {
  rootDir: 'src',

  projects: [tscProject, tslintProject],
};
