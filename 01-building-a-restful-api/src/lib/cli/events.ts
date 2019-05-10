import EventEmitter from 'events';

class CliEventEmitter extends EventEmitter {}

const events = new CliEventEmitter();

type EventListener = (str: string) => void;

const handleHelp: EventListener = () => {
  console.log('you called for help');
};

const handleExit: EventListener = () => {
  process.exit(0);
};

const handleStats: EventListener = () => {};
const handleListUsers: EventListener = () => {};
const handleMoreUserInfo: EventListener = () => {};
const handleListChecks: EventListener = () => {};
const handleMoreCheckInfo: EventListener = () => {};
const handleListLogs: EventListener = () => {};
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
