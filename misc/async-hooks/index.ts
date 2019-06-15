import * as asyncHooks from 'async_hooks';
import * as fs from 'fs';

let targetExecutionContext;

const getTime = (fn: (d: number) => void) => {
  setInterval(() => {
    fs.writeSync(
      1,
      `when interval runs, execution context is: ${asyncHooks.executionAsyncId()}\n`
    );

    fn(Date.now());
  }, 1000);
};

getTime((time: number) => {
  fs.writeSync(1, `the time is ${time}\n`);
});

const hooks: asyncHooks.HookCallbacks = {
  init(asyncId) {
    fs.writeSync(1, `hook init ${asyncId}\n`);
  },
  before(asyncId) {
    fs.writeSync(1, `hook before ${asyncId}\n`);
  },
  after(asyncId) {
    fs.writeSync(1, `hook after ${asyncId}\n`);
  },
  destroy(asyncId) {
    fs.writeSync(1, `hook destroy ${asyncId}\n`);
  },
  promiseResolve(asyncId) {
    fs.writeSync(1, `hook promiseResolve ${asyncId}\n`);
  },
};

const asyncHook = asyncHooks.createHook(hooks);

asyncHook.enable();
