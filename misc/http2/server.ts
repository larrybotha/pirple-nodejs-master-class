import * as http2 from 'http2';

const server = http2.createServer();

/*
 * handle client connections by returning an html response
 */
server.on('stream', (stream, headers) => {
  stream.respond({
    status: 200,
    'content-type': 'text/html',
  });

  stream.end(`
    <html>
      <body>
        <p>hello world</p>
      </body>
    </html>
    `);
});

/*
 * make connections to the server available by listening on a port
 */
server.listen(6000);
