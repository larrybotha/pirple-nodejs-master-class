import server from './lib/server';
import workers from './lib/workers';

const init = () => {
  // start the server
  server.init();

  // start the workers
  workers.init();
};

const app = {init};

app.init();

module.exports = app;
