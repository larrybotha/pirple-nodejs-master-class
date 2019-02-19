import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import {config} from './config';

type Init = () => void;
const init: Init = () => {
  const httpServer = http.createServer();

  httpServer.listen(config.http.port, () => {
    // tslint:disable-next-line
    console.log(`listening on ${config.http.port}`);
  });

  const httpsServer = https.createServer({
    cert: fs.readFileSync(config.https.sslCertPath),
    key: fs.readFileSync(config.https.sslKeyPath),
  });

  httpsServer.listen(config.https.port, () => {
    // tslint:disable-next-line
    console.log(`listening on ${config.https.port}`);
  });
};

export {init};
