import * as https from 'https';
import * as querystring from 'querystring';
import * as util from 'util';

import config from '../../config';
import {
  exists,
  hasLength,
  Invalid,
  maxLength,
  trim,
  Valid,
  Validator,
} from '../validations';

import {validatePhone} from '../services/validations/users';

const twilioConfig = config.apis.twilio;

/*
 * send sms via Twilio
 *
 * @param {object} options
 * @param {string} options.phone - the number to send an sms to
 * @param {string} options.msg - the message to send
 *
 * @return Promise
 */
type SendSms = (options: {phone: string; msg: string}) => Promise<any>;
const sendSms: SendSms = options => {
  return new Promise((resolve, reject) => {
    const phone = validatePhone(options.phone);
    const msg = [options.msg]
      .map(trim())
      .map(exists('message is required'))
      .map(
        maxLength(1600, 'message must be no longer than 1600 characters long')
      )
      .find(Boolean);
    const fields = [phone, msg];
    const invalidFields = fields.filter((f: Valid | Invalid) =>
      Boolean(f.error)
    );

    if (!invalidFields.length) {
      const payload = {
        Body: msg,
        From: twilioConfig.fromPhone,
        To: `+27${phone}`,
      };
      const stringifiedPayload = querystring.stringify(payload);
      const requestOptions: https.RequestOptions = {
        auth: `${twilioConfig.sid}:${twilioConfig.token}`,
        headers: {
          'Content-Type': 'application/x-www-url-form-encoded',
          'Content-length': Buffer.byteLength(stringifiedPayload),
        },
        hostname: 'api.twilio.com',
        method: 'POST',
        path: `/2010-04-01/${twilioConfig.sid}/Messages.json`,
        protocol: 'https',
      };

      const request = https.request(requestOptions, res => {
        const {statusCode} = res;

        if ([200, 201].indexOf(statusCode) > -1) {
          return resolve(res);
        } else {
          return reject(res);
        }
      });

      request.on('error', err => reject(err));

      // write data to request body
      request.write(stringifiedPayload);

      // execute the request
      request.end();
    } else {
      reject({error: `Invalid sms fields: ${invalidFields.join(', ')}`});
    }
  });
};

export {sendSms};
