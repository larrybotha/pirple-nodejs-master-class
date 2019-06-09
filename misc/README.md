 Miscellaneous topcis

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [`http2`](#http2)

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
