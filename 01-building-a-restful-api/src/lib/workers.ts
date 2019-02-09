/*
 * Worker-related tasks
 */
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';

import dataLib from './data';
import helpers from './helpers';

import {Check} from './types/services/checks';

type GatherAllChecks = () => void;
const gatherAllChecks: GatherAllChecks = async () => {
  try {
    const checks: Check[] = await dataLib.list('checks');

    if (checks.length === 0) {
      throw new Error('No checks');
    }

    checks.map(validateCheckData);
  } catch (err) {
    // tslint:disable-next-line
    console.log(err);
  }
};

type ValidateCheckData = (check: Check) => void;
const validateCheckData: ValidateCheckData = check => {};

/*
 * Execute worker process once per minute
 */
type Loop = () => void;
const loop: Loop = () => {
  setInterval(() => {
    gatherAllChecks();
  }, 1000 * 60);
};

type Init = () => void;
const init: Init = () => {
  // create all checkes
  gatherAllChecks();

  // create a loop so checks will continue to be run
  loop();
};

interface Workers {
  init: Init;
}
const workers = {init};

export default workers;
