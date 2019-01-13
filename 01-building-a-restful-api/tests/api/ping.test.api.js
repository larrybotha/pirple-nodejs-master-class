const {handleResult} = require('jest-runner-newman/handle-result');
const newman = require('newman');

const config = require('./config');

module.exports = newman.run({...config, folder: 'ping-tests'}, handleResult);
