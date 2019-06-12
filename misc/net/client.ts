import * as net from 'net';

const outboundMessage = 'ping';

/*
 * create a connectino to a TCP server on port 6000
 */
const client = net.createConnection({port: 6000}, () => {
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
