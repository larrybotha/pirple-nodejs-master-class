 Miscellaneous topcis

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [HTTP2](#http2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## HTTP2

[http2/server.ts]('./http2/server.ts')

[http2/client.ts]('./http2/client.ts')

`http2` comes with support for web-sockets out of the box by making communication
between client and server available through streams.

In addition to requests needing to be processed within streams on the server, a
client using `http2` needs to also process data using streams.

This is because information can be passed in both directions, from client to
server, using streams.
