 Miscellaneous topcis

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [`http2`](#http2)
- [`vm`](#vm)
- [UDP / Datagram](#udp--datagram)
- [`net`](#net)
- [TLS / SSL](#tls--ssl)
- [REPL](#repl)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## `http2`

[http2/server.ts]('./http2/server.ts')

[http2/client.ts]('./http2/client.ts')

`http2` comes with support for web-sockets out of the box by making communication
between client and server available through streams.

In addition to requests needing to be processed within streams on the server, a
client using `http2` needs to also process data using streams.

This is because information can be passed in both directions, from client to
server, using streams.

```javascript
const http2 = require('http2')

const port = 6000;

/*
 * http2 server
 */
const server = http2.createServer();

server.on('stream', (stream, headers) => {
  stream.respond({
    status: 200,
    'content-type': 'application/json'
  });

  stream.end(JSON.stringify({foo: 'bar'}))
})

server.listen(port);

/*
 * http2 client
 */
const client = http2.connect(`http://localhost:${port}`);
/*
 * configure request headers
 */
const req = client.request({
  /*
   * set the path of the request
   */
  ':path': '/',
});
let str = '';

req.on('data', chunk => str += chunk);
req.on('end', () => console.log(str))

req.end();
```

## `vm`

[vm/index.ts]('./vm/index.ts')

Node's `vm` module allows code to be run, insecurely, in a V8 virtual machine.

A context, or sandbox, can be provided for a `vm` to run in.

```javascript
const vm = require('vm');

const context = {
  foo: 2,
};

const script = new vm.Script(`
  foo = foo * 2;
`);

script.runInNewContext(context);

console.log(context);
// => {foo: 4}
```

## UDP / Datagram

[udp/server.ts]('./udp/server.ts')

UDP allows messages to be sent and packets to be dropped, in contrast to TCP
which waits for all packets or re-requests failed packets.

UDP is most useful in streaming services. It can be configured to communicate
via IPv4 if a socket is created with `udp4`, else IPv6 if configured with
`udp6`.

UDP doesn't distinguish between client and server, so the same interface is used
to both send and receive messages:

```javascript
const dgram = require('dgram');

/*
 * server
 */
const server = dgram.createSocket('udp4');

server.on('message', (msgBuf, sender) => {
  const msg = msgBuf.toString();

  console.log(msg);
});

server.bind(6000);

/*
 * client
 */
const client = dgram.createSocket('udp4');
const buf = Buffer.from('my message');

client.send(buf, 6000, 'localhost', err => {
  client.close();
})
```

## `net`

[net/server.ts]('./net/server.ts')

[net/client.ts]('./net/client.ts')

Node is not often used for low-level networking applications, but is a good fit,
because it exposes TCP to you.

Whenever you see `net` in the context of NodeJs, you can ne confident you're
looking at TCP.

## TLS / SSL

[tls-ssl/server.ts]('./tls-ssl/server.ts')

[tls-ssl/client.ts]('./-sssltl/client.ts')

TLS / SSL is the equivalent for `net` as `https` is to `http`.

Client and server are created in the same way as in the `net` module, with the
exception of passing in an options object with cert properties when creating a
server.

## REPL

[repl/index.ts]('./repl/index.ts')

Instead of using `readline` to get user input, Node has alreay abstracted all
the work in creating a REPL away by providing the `repl` module:

```javascript
const repl = require('repl');

repl.start({
  eval: str => {
    console.log(`you entered: ${str}`);
  }
})
```
