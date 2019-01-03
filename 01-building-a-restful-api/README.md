# Building a RESTful API

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

```bash
$ cd 01-building-a-restful-api
$ npm start
```

## Parsing request paths

Node ships with a `url` module for URL resolution and parsing.

A URL can be parsed by `url.parse` with or without parsing the query string. To
parse a URL with its query string, pass `true` as a second argument after the
url:

```javascript
const url = require('url')

url.parse(myUrl, true);
```

The query string is parsed with Node's `querystring` module.

If the query string is not parsed, it will be returned as a string.

## Parsing payloads

Payloads in requests in Node are stream objects. The data isn't available as a
single object once the request is made.

To aggregate the stream we need to listen to the requests's `data` event and
write that data to memory until the stream emits its `end` event.

To do this, we make use of `StringDecoder` in Node's `string_decoder` module:

```javascript
const {StringDecoder} = require('string_decoder');

// utf-8 is default
const decoder = new StringDecoder('utf-8')
let data = ''

myStream.on('data', d => {
  data += decoder.write(d);
})

myStream.on('end', () => {
  // write any remaining data to the buffer
  data += decoder.end()

  // do what you want with the data
})
```

## Routing requests

We have all the data in the request by parsing the querystring, getting the
method, headers, pathname, and payload.

By evaluating the pathname we can call different route handlers, passing in the
payload from the request, and returning a status code and any data we want to
send back in the response.

## Returning JSON

One needs to indicate explicitly to the client the type of data being sent back.
This can be done either by passing headers to `res.writeHead`, or by adding
individual headers to `res.setHeader`:

```javascript
res.setHeader('Content-type', 'application/json')
```

`res.setHeader` needs to come before `res.writeHead`. Headers added via
`res.setHeader` are aggregated into `res.writeHead`.
