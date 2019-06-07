import * as cluster from 'cluster';
import * as os from 'os';

import cli from './lib/cli';
import server from './lib/server';
import workers from './lib/workers';

const init = () => {
  // if on master cluster, start cli and workers
  if (cluster.isMaster) {
    process.nextTick(cli.init);

    // start the workers
    workers.init();

    // create a forked cluster for each core available
    Array.from({length: os.cpus().length}).map(() => {
      cluster.fork();
    });
  }
  // if not on master, serve requests on all cores
  else {
    // start the server
    server.init();

    // tslint:disable-next-line
    console.log(`worker ${process.pid} died`);
  }
};

const app = {init};

app.init();

module.exports = app;
