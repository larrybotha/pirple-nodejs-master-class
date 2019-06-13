/*
 * TCP (tls) server
 */
import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';

const options = {
  cert: fs.readFileSync(
    path.join(__dirname, '../../01-building-a-restful-api/https/cert.pem')
  ),
  key: fs.readFileSync(
    path.join(__dirname, '../../01-building-a-restful-api/https/key.pem')
  ),
};

const server: tls.Server = tls.createServer(options, connection => {
  const outboundMessage = 'pong';

  /*
   * send messages from the serer
   */
  connection.write(outboundMessage);

  /*
   * handle messages coming from a client
   */
  connection.on('data', inboundMessage => {
    const msg = inboundMessage.toString();

    console.log(`
      I said ${outboundMessage},
      they said ${inboundMessage}
    `);
  });
});

server.listen(6000);
