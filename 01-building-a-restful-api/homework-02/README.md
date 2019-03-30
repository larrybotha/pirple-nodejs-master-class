<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Building a RESTful API - Homework 02](#building-a-restful-api---homework-02)
  - [Integration Tests](#integration-tests)
  - [Takeaways](#takeaways)
    - [`https.request`](#httpsrequest)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Building a RESTful API - Homework 02

## Integration Tests

Run:

```bash
npx strest test
```

## Takeaways

### `https.request`

- to send data as form data, add the `Content-Type` header:

    ```javascript
    const options = {
      headers: {
        `Content-Type`: `application/x-www-form-urlencoded`
      }
    }
    ```
- to encode data for submission as form data:

    ```javascript
    const formData = require('querystring').stringify(myObj);
    ```
- to send data using bearer authentication:

    ```javascript
    const requestOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`
      }
    }
    ```
