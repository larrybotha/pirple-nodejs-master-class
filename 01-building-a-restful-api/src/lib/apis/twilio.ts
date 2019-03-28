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
        To: `+27${phone.replace(/^0/, '')}`,
      };
      const stringifiedPayload = querystring.stringify(payload);
      const requestOptions: https.RequestOptions = {
        auth: `${twilioConfig.sid}:${twilioConfig.token}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-length': Buffer.byteLength(stringifiedPayload),
        },
        hostname: 'api.twilio.com',
        method: 'POST',
        path: `/2010-04-01/Accounts/${twilioConfig.sid}/Messages.json`,
        protocol: 'https:',
      };

      const request = https.request(requestOptions, res => {
        const {statusCode} = res;
        let d: any[] = [];
        res.setEncoding('utf8');

        res.on('data', data => {
          d = d.concat(data);
        });

        res.on('end', (data: string) => {
          d = d.concat(data);
          const result = JSON.parse(d.join(''));

          if ([200, 201].indexOf(statusCode) > -1) {
            return resolve(result);
          } else {
            return reject(result);
          }
        });
      });

      request.on('error', err => {
        return reject(err);
      });

      // Write data to request body and send request
      // Equivalent to:
      //  request.write(stringifiedPayload);
      //  reuuest.end();
      request.end(stringifiedPayload);
    } else {
      reject(`Invalid sms fields: ${invalidFields.join(', ')}`);
    }
  });
};

export {sendSms};
