import * as repl from 'repl';

const options: repl.ReplOptions = {
  prompt: '> ',
  eval: str => {
    const response = str.trim() === 'fizz' ? 'buzz' : 'fizz';

    console.log(response);
  },
};

repl.start(options);
