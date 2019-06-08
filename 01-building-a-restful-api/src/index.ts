import * as cluster from 'cluster';
import * as os from 'os';

import cli from './lib/cli';
import server from './lib/server';
import workers from './lib/workers';

const startSingleProcesses = () => {
  // start cli
  process.nextTick(cli.init);

  // start the workers
  workers.init();
};

const startMultiProcesses = () => {
  // start the server
  server.init();
};

const startCluster = () => {
  // if on master cluster, start cli and workers
  if (cluster.isMaster) {
    startSingleProcesses();

    // create a forked cluster for each core available
    Array.from({length: os.cpus().length}).map(() => {
      cluster.fork();
    });
  }
  // if not on master, serve requests on all cores
  else {
    startMultiProcesses();

    // tslint:disable-next-line
    console.log(`worker ${process.pid} died`);
  }
};

const init = () => {
  if (process.env.NODE_ENV === 'production') {
    startCluster();
  } else {
    startSingleProcesses();
    startMultiProcesses();
  }
};

const app = {init};

app.init();

module.exports = app;
