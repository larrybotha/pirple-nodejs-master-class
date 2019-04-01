import * as https from 'https';

import {safeJSONParse} from '../helpers';

/**
 * createRequest
 *
 * Helper for creating requests
 *
 * @param {object} - request options for this request
 * @param {any} payload - data to send in request
 * @returns {undefined}
 */
const createRequest = (
  requestOptions: https.RequestOptions = {},
  payload?: any
): Promise<any> => {
  // querystring.stringify formats data as required by servers parsing form data
  return new Promise((resolve, reject) => {
    const request = https.request(requestOptions, res => {
      const {statusCode} = res;
      let data: string[] = [];
      res.setEncoding('utf8');

      res.on('data', d => (data = data.concat(d)));

      res.on('end', (d: string) => {
        data = data.concat(d);
        const result = safeJSONParse(data.join(''));

        if (/^2/.test(`${statusCode}`)) {
          return resolve(result);
        } else {
          return reject({statusCode, ...result});
        }
      });
    });

    request.on('error', err => {
      return reject(err);
    });

    request.end(payload);
  });
};

export {createRequest};
