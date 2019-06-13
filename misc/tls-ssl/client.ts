import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';

const options = {
  ca: fs.readFileSync(
    path.join(__dirname, '../../01-building-a-restful-api/https/cert.pem')
  ), // only required because we're using a self-assigned certificate
};

const outboundMessage = 'ping';

/*
 * create a connectino to a TCP server on port 6000
 */
const client: tls.TLSSocket = tls.connect(6000, options, () => {
  client.write(outboundMessage);
});

/*
 * when the server sends a message, handle it
 */
client.on('data', inboundMessage => {
  const msg = inboundMessage.toString();

  console.log(`
    I said ${outboundMessage},
    they said ${inboundMessage}
  `);

  /*
   * close the message once we have a response
   */
  client.end();
});
