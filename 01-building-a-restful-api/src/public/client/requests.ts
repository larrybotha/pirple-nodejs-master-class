import {RequestOptions} from './types/client';

const createQueryString = (
  obj: RequestOptions['queryStringObject']
): string => {
  const qs = Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return qs.length ? `?${qs}` : '';
};

const makeRequest = ({
  headers = [],
  queryStringObject = {},
  ...rest
}: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    const {callback, method, path, payload, sessionToken} = rest;
    const xhr = new XMLHttpRequest();
    const qs = createQueryString(queryStringObject);
    const requestUrl = `${path}${qs}`;

    xhr.open(method, requestUrl);

    xhr.setRequestHeader('Content-type', 'application/json');

    headers.map(({name, value}) => xhr.setRequestHeader(name, value));

    if (sessionToken) {
      xhr.setRequestHeader('token', sessionToken.id);
    }

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const {responseText, status} = xhr;

        try {
          const parsedResponse = JSON.parse(responseText);

          if (/^2/.test(`${status}`)) {
            resolve(parsedResponse);
          } else {
            resolve(parsedResponse);
          }
        } catch (err) {
          if (/^2/.test(`${status}`)) {
            resolve(responseText);
          } else {
            reject(responseText);
          }
        }
      }
    });

    xhr.send(payload ? JSON.stringify(payload) : undefined);
  });
};

const requests = {makeRequest};

export {requests};
