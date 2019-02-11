/*
 * Worker-related tasks
 */
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';

import {sendSms} from './apis/twilio';
import dataLib from './data';
import logsLib from './logs';
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
      // tslint:disable-next-line
      console.log('No checks');
    }

    checks.map(validateCheckData);
  } catch (err) {
    // tslint:disable-next-line
    console.log(`Error: ${err}`);
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
  const invalidFields = fields.filter(f => Boolean(f.error));

  if (!invalidFields.length) {
    performCheck(check);
  } else {
    // tslint:disable-next-line
    console.log(`Error: invalid check fields - ${invalidFields.join(', ')}`);
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
const processCheckOutcome: ProcessCheckOutcome = async (
  check,
  checkOutcome
) => {
  const {error, responseCode} = checkOutcome;
  const {lastChecked, successCodes, state} = check;
  // check state is up if there is no error, we have a response code, and that
  // response code is one of the successCodes the check is configured for
  const newCheckState =
    !error && responseCode && successCodes.indexOf(responseCode) > -1
      ? CheckState.Up
      : CheckState.Down;
  // if the check state has changed, and we have a lastChecked time, send an alert
  const shouldSendAlert = lastChecked && newCheckState !== state;
  const newCheckData = {
    ...check,
    lastChecked: Date.now(),
    state: newCheckState,
  };

  try {
    const result: Check = await dataLib.update(
      'checks',
      check.id,
      newCheckData
    );

    log({
      alert: shouldSendAlert,
      check: result,
      outcome: checkOutcome,
      createdAt: Date.now(),
    });

    if (shouldSendAlert) {
      alertUserToStateChange(result);
    } else {
      // tslint:disable-next-line
      console.log('Check state has not changed, no alert required');
    }
  } catch (err) {
    // tslint:disable-next-line
    console.log(`Error: ${JSON.stringify(err, null, 2)}`);
  }
};

type AlertUserToStateChange = (check: Check) => void;
const alertUserToStateChange: AlertUserToStateChange = async check => {
  const {method, phone, protocol, state, url: checkUrl} = check;
  const msg = `Alert: your check for ${method.toUpperCase()} ${protocol}://${checkUrl} has changed to state ${state}`;

  try {
    const result = await sendSms({phone, msg});

    // tslint:disable-next-line
    console.log(`Success, sms was sent to ${phone}`, result);
  } catch (err) {
    // tslint:disable-next-line
    console.log(`Error: send sms`, err);
  }
};

type Log = (options: {
  alert: boolean;
  check: Check;
  outcome: CheckOutcome;
  createdAt: number;
}) => void;
const log: Log = async options => {
  const logString = JSON.stringify(options);
  const filename = options.check.id;

  try {
    const result = await logsLib.append(filename, logString);
  } catch (err) {}
};

/*
 * Execute worker process once per minute
 */
type Loop = () => void;
const loop: Loop = () => {
  setInterval(gatherAllChecks, 1000 * 5);
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
