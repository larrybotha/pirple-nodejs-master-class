import EventEmitter from 'events';
import * as os from 'os';
import * as v8 from 'v8';

import {User} from '../types/services/users';
import {Check, CheckState} from '../types/services/checks';
import {
  centeredText,
  horizontalLine,
  logObjectToStdOut,
  verticalSpace,
} from './helpers';

import dataLib from '../data';

class CliEventEmitter extends EventEmitter {}

const events = new CliEventEmitter();

type EventListener = (str: string) => void;

const handleHelp: EventListener = () => {
  const commandMap = {
    exit: 'Kill CLI and app',
    man: 'show this help',
    help: 'alias of "man"',
    stats: 'get OS stats and utilisation',
    'list users': 'show list of registered users',
    'more user info --{userId}': 'show details of specific user',
    'list checks --[up|down]': 'show a list of active checks',
    'more check info --{checkId}': 'show details of specific check',
    'list logs': 'show a list of all logs',
    'more log info --{filename}': 'show details of a specific log',
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
    'Load Average': os.loadavg().join(' '),
    'CPU Count': os.cpus().length,
    'Free Memory': os.freemem(),
    'Current Malloced Memory': malloced_memory,
    'Peak Malloced Memory': peak_malloced_memory,
    'Allocated Heap Used (%)': Math.round(
      (used_heap_size / total_heap_size) * 100
    ),
    'Available Heap Allocated (%)': Math.round(
      (total_heap_size / heap_size_limit) * 100
    ),
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
    const logs = await dataLib.list('../.logs', '.log');

    console.dir(logs, {colors: true});
  } catch (err) {
    // tslint:disable-next-line
    console.log(err);
  }
};

const handleMoreLogInfo: EventListener = () => {};

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
