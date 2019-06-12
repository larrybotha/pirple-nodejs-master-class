/*
 * TCP (net) server
 */
import * as net from 'net';

const server = net.createServer(connection => {
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
