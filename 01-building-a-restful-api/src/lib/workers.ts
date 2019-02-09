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

import {
  validateId,
  validateMethod,
  validateProtocol,
  validateSuccessCodes,
  validateTimeoutSeconds,
  validateUrl,
} from './services/validations/checks';
import {validatePhone} from './services/validations/users';
import {Check, CheckState} from './types/services/checks';

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
const validateCheckData: ValidateCheckData = check => {
  const checkUrl = validateUrl(check.url);
  const id = validateId(check.id);
  const method = validateMethod(check.method);
  const phone = validatePhone(check.phone);
  const protocol = validateProtocol(check.protocol);
  const successCodes = validateSuccessCodes(check.successCodes);
  const timeoutSeconds = validateTimeoutSeconds(check.timeoutSeconds);
  const checkState = check.state || CheckState.Down;
  const lastChecked = check.lastChecked;
  const fields = [
    checkUrl,
    id,
    method,
    phone,
    protocol,
    successCodes,
    timeoutSeconds,
  ];
  const invalidFields = fields.map(f => Boolean(f.error));

  if (!invalidFields) {
    performCheck(check);
  } else {
    // tslint:disable-next-line
    console.log(`Error: invalid fields - ${invalidFields.join(', ')}`);
  }
};

interface CheckOutcome {
  error?: Error;
  responseCode?: number;
}

type PerformCheck = (check: Check) => void;
const performCheck: PerformCheck = check => {
  const {method, protocol, successCodes, timeoutSeconds, url: checkUrl} = check;
  const checkOutcome: CheckOutcome = {
    error: null,
    responseCode: null,
  };
  let outcomeSent = false;

  const parsedUrl = url.parse(`${protocol}://${url}`);
  const {hostname, path: checkPath} = parsedUrl;
  const requestOptions: http.RequestOptions = {
    hostname,
    method: method.toUpperCase(),
    path: checkPath,
    protocol: `${protocol}:`,
    timeout: timeoutSeconds * 1000,
  };
  const httpModule = protocol === 'http' ? http : https;
  const req = httpModule.request(requestOptions, res => {
    const {statusCode} = res;
    checkOutcome.responseCode = statusCode;

    if (!outcomeSent) {
      processCheckOutcome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on('error', err => {
    checkOutcome.error = err;

    if (!outcomeSent) {
      processCheckOutcome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on('timeout', err => {
    checkOutcome.error = Error('timeout');

    if (!outcomeSent) {
      processCheckOutcome(check, checkOutcome);
      outcomeSent = true;
    }
  });

  req.end();
};

type ProcessCheckOutcome = (check: Check, checkOutcome: CheckOutcome) => void;
const processCheckOutcome: ProcessCheckOutcome = (check, checkOutcome) => {};

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
