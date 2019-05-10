import * as readline from 'readline';
import {debuglog} from 'util';

import {events} from './events';

const debug = debuglog('cli');

type ProcessInput = (str: string) => void;
const processInput: ProcessInput = str => {
  const sanitizedString = [str]
    .filter(s => typeof s === 'string')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.toLowerCase())
    .find(Boolean);

  if (sanitizedString) {
    const validInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info',
    ];
    const userInput = validInputs.find(input => {
      const regex = new RegExp(input);

      return regex.test(sanitizedString);
    });

    if (userInput) {
      events.emit(userInput, sanitizedString);
    } else {
      // tslint:disable-next-line
      console.log(`unknown command ${sanitizedString}`);
    }
  }
};

type Init = () => void;
const init: Init = () => {
  // tslint:disable-next-line
  console.log('\x1b[34m%s\x1b[0m', 'CLI is running');

  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  // initialise the prompt
  readlineInterface.prompt();

  // initialise a listener that accepts input from stdin
  readlineInterface.on('line', (str: string) => {
    // process the input
    processInput(str);

    // re-initialise the prompt for further input
    readlineInterface.prompt();
  });

  // if the user kills the server, exit
  readlineInterface.on('close', () => {
    process.exit(0);
  });
};

const cli = {init};

export default cli;
