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

const twilioConfig = config.apis.twilio;

/*
 * send sms via Twilio
 *
 * @param {object} options
 * @param {string} options.phone - the number to send an sms to
 * @param {string} options.msg - the message to send
 * @param {function} cb - the callback for success / failure in sending the sms
 *
 * @return undefined
 */
type SendSms = (
  options: {phone: string; msg: string},
  cb: (res: {ok: boolean; error?: any}) => void
) => void;
const sendSms: SendSms = (options, callback) => {
  const phone = [options.phone]
    .map(trim())
    .map(exists('phone is required'))
    .map(hasLength(10, 'phone must be at least 10 characters long'))
    .find(Boolean);
  const msg = [options.msg]
    .map(trim())
    .map(exists('message is required'))
    .map(maxLength(1600, 'message must be no longer than 1600 characters long'))
    .find(Boolean);
  const fields = [phone, msg];
  const invalidFields = fields.map((f: Valid | Invalid) => Boolean(f.error));

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
        callback({ok: true});
      } else {
        callback({
          error: `Twilio responded with status code ${statusCode}`,
          ok: false,
        });
      }
    });

    request.on('error', err => callback({ok: false, error: err}));

    // write data to request body
    request.write(stringifiedPayload);

    // execute the request
    request.end();
  }
};

export {sendSms};
