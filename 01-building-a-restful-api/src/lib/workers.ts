/*
 * Worker-related tasks
 */
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';

import * as dataLib from './data';
import * as helpers from './helpers';

const gatherAllChecks = () => {};

const loop = () => {};

const init = () => {
  // create all checkes
  gatherAllChecks();

  // create a loop so checks will continue to be run
  loop();
};

const workers = {init};

export default workers;
