import server from './server/server';
import workers from './server/workers';

const init = () => {
  // start the server
  server.init();

  // start the workers
  workers.init();
};

const app = {init};

app.init();

module.exports = app;
