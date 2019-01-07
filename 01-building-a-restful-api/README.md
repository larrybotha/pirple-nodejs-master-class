# Building a RESTful API

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Homework](#homework)
  - [01](#01)
- [Parsing request paths](#parsing-request-paths)
- [Parsing payloads](#parsing-payloads)
- [Routing requests](#routing-requests)
- [Returning JSON](#returning-json)
- [Generating a key and certificate for HTTPS](#generating-a-key-and-certificate-for-https)
- [`ping` service](#ping-service)
- [Creating, reading, updating, and deleting files](#creating-reading-updating-and-deleting-files)
  - [Creating files](#creating-files)
  - [Reading files](#reading-files)
  - [Updating files](#updating-files)
  - [Deleting files](#deleting-files)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

```bash
$ cd 01-building-a-restful-api
$ npm start
```

## Homework

### 01

[index.ts](./homework-01/src/index.ts)

```bash
$ cd 01-building-a-restful-api
$ npm run start:homework-01
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

## Generating a key and certificate for HTTPS

```bash
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

Node's `https.createServer` requires an options object containing at least the
certificate and key.

These need to be read in using `fs.readFileSync` as the https server can't start
until it has the required options:

```javascript
const options = {
  cert: fs.readFileSync('./https/cert.pem'),
  key: fs.readFileSync('./https/key.pem'),
}

const httpsServer = https.createServer(options, (req, res) => {...})
```

## `ping` service

A ping service doesn't do anything except indicate whether the server is alive
or not. This is generally what is provided to status services for uptime
monitoring.

## Creating, reading, updating, and deleting files

Node's `util.promisify` can be used to convert the `(err, result)` callback
style of many of Node's async functions to Promises, which can then be used with
`async / await`.

### Creating files

Files that are opened for reading / writing need to be closed so that data is
not lost, and to de-allocate memory used while they are open.

```javascript
try {
  // create file if it doesn't exist, otherwise throw an error
  const fileDescriptor = await promisify(fs.open)(filename, 'wx');

  // write data to the file
  await promisify(fs.writeFile)(fileDescriptor, JSON.stringify(data))

  // close file once we're done
  await promisify(fs.close(fileDescriptor))
} catch(err) {
  console.log(err)
}
```

### Reading files

```javascript
try {
  const result = await promisify(fs.readFile)(filename)
} catch (err) {
  console.log(err)
}
```

### Updating files

```javascript
try {
  // open the file for reading and writing, throwing an error if there's an issue
  const fileDescriptor = await promisify(fs.open)(filename, 'r+')

  // truncate the contents of the file
  await promisify(fs.truncate)(filename)

  // write the data to the file
  await promisify(fs.writeFile)(filename, JSON.stringify(data))

  // close the file
  await promisify(fs.close)(fileDescriptor)
} catch (err) {
  console.log(err)
}
```

### Deleting files

```javascript
try {
  await promisify(fs.unlink)(filename)
} catch (err) {
  console.log(err)
}
```
