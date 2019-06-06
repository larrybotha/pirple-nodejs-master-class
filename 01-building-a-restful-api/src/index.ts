import * as cluster from 'cluster';
import * as os from 'os';

import cli from './lib/cli';
import server from './lib/server';
import workers from './lib/workers';

const init = () => {
  if (cluster.isMaster) {
    process.nextTick(cli.init);

    Array.from({length: os.cpus().length}).map(() => {
      cluster.fork();
    });
  } else {
    // start the server
    server.init();

    // start the workers
    workers.init();

    // tslint:disable-next-line
    console.log(`worker ${process.pid} died`);
  }
};

const app = {init};

app.init();

module.exports = app;
