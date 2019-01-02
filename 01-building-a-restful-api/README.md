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
