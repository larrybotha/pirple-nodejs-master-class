import * as dgram from 'dgram';

/*
 * create a server
 *
 * Use:
 * - IPv4 udp4 / 127.0.0.1
 * - IPv6 udp6 / ::1
 */
const server = dgram.createSocket('udp4');

server.on('message', (messageBuffer, sender) => {
  const msgString = messageBuffer.toString();

  console.log(msgString);
});

server.bind(6000);
