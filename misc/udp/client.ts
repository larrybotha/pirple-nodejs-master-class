import * as dgram from 'dgram';

/*
 * creating a client is done the same way as creating a server - UDP doesn't
 * distinguish between the two concerns
 */
const client = dgram.createSocket('udp4');
const msg = 'hello world';
const buf = Buffer.from(msg);

client.send(buf, 6000, 'localhost', err => {
  client.close();
});
