import EventEmitter from 'events';
import * as os from 'os';
import * as v8 from 'v8';

import {Check, CheckState} from '../types/services/checks';
import {User} from '../types/services/users';
import {
  centeredText,
  horizontalLine,
  logObjectToStdOut,
  verticalSpace,
} from './helpers';

import dataLib from '../data';
import logsLib from '../logs';

class CliEventEmitter extends EventEmitter {}

const events = new CliEventEmitter();

type EventListener = (str: string) => void;

const handleHelp: EventListener = () => {
  const commandMap = {
    exit: 'Kill CLI and app',
    help: 'alias of "man"',
    man: 'show this help',
    stats: 'get OS stats and utilisation',

    'list checks --[up|down]': 'show a list of active checks',
    'list logs': 'show a list of all logs',
    'list users': 'show list of registered users',
    'more check info --{checkId}': 'show details of specific check',
    'more log info --{filename}': 'show details of a specific log',
    'more user info --{userId}': 'show details of specific user',
  };

  logObjectToStdOut(commandMap, 'CLI MANUAL');
};

const handleExit: EventListener = () => {
  process.exit(0);
};

const handleStats: EventListener = () => {
  const {
    malloced_memory,
    peak_malloced_memory,
    used_heap_size,
    total_heap_size,
    heap_size_limit,
  } = v8.getHeapStatistics();
  const statsMap = {
    'Allocated Heap Used (%)': Math.round(
      (used_heap_size / total_heap_size) * 100
    ),
    'Available Heap Allocated (%)': Math.round(
      (total_heap_size / heap_size_limit) * 100
    ),
    'CPU Count': os.cpus().length,
    'Current Malloced Memory': malloced_memory,
    'Free Memory': os.freemem(),
    'Load Average': os.loadavg().join(' '),
    'Peak Malloced Memory': peak_malloced_memory,
    Update: `${os.uptime()}s`,
  };

  logObjectToStdOut(statsMap, 'SYSTEM STATS');
};

const handleListUsers: EventListener = async () => {
  try {
    const users: User[] = await dataLib.list('users');

    users.map(user => {
      const {phone, firstName, checks} = user;
      const userDetails = {
        checks,
        firstName,
        phone,
      };
      // tslint:disable-next-line
      console.log(JSON.stringify(userDetails, null, 2));
    });
  } catch (err) {
    // tslint:disable-next-line
    console.log(err);
  }
};

const handleMoreUserInfo: EventListener = async cmd => {
  const userId = (cmd.match(/--\w+/) || [])
    .map(s => s.replace('--', ''))
    .find(Boolean);

  if (userId) {
    try {
      const user: User = await dataLib.read('users', userId);
      delete user.password;

      // tslint:disable-next-line
      console.dir(user, {colors: true});
    } catch (err) {
      // tslint:disable-next-line
      console.log('User not found');
    }
  } else {
    // tslint:disable-next-line
    console.log('no --userId param provided');
  }
};

const handleListChecks: EventListener = async cmd => {
  const param = (cmd.match(/--\w+/) || [])
    .map(s => s.replace('--', ''))
    .filter(s => /up|down/.test(s))
    .map(s => [s[0].toUpperCase(), s.slice(1)].join(''))
    .find(Boolean);
  const state = param ? CheckState[param as any] : '';

  try {
    const checks: Check[] = await dataLib.list('checks');
    const filteredChecks = state
      ? checks.filter(check => check.state === state)
      : checks;

    // tslint:disable-next-line
    console.dir(filteredChecks, {colors: true});
  } catch (err) {
    // tslint:disable-next-line
    console.log('unable to list checks', err);
  }
};

const handleMoreCheckInfo: EventListener = async cmd => {
  const checkId = (cmd.match(/--\w+/) || [])
    .map(s => s.replace('--', ''))
    .find(Boolean);

  if (checkId) {
    try {
      const check: Check = await dataLib.read('checks', checkId);

      // tslint:disable-next-line
      console.dir(check, {colors: true});
    } catch (err) {
      // tslint:disable-next-line
      console.log('Check not found');
    }
  } else {
    // tslint:disable-next-line
    console.log('no --userId param provided');
  }
};

const handleListLogs: EventListener = async () => {
  try {
    const logs = await logsLib.list(true);

    // tslint:disable-next-line
    console.dir(logs, {colors: true});
  } catch (err) {
    // tslint:disable-next-line
    console.log(err);
  }
};

const handleMoreLogInfo: EventListener = async cmd => {
  const logId = (cmd.match(/--\w+/) || [])
    .map(s => s.replace('--', ''))
    .find(Boolean);

  if (logId) {
    try {
      const log = await dataLib.read('../.logs', logId, '.log');

      // tslint:disable-next-line
      console.dir(log, {colors: true});
    } catch (err) {
      // tslint:disable-next-line
      console.log('Log not found');
    }
  } else {
    // tslint:disable-next-line
    console.log('no --{logId} param provided');
  }
};

events.on('man', handleHelp);
events.on('help', handleHelp);
events.on('exit', handleExit);
events.on('stats', handleStats);
events.on('list users', handleListUsers);
events.on('more user info', handleMoreUserInfo);
events.on('list checks', handleListChecks);
events.on('more check info', handleMoreCheckInfo);
events.on('list logs', handleListLogs);
events.on('more log info', handleMoreLogInfo);

export {events};
