import * as querystring from 'querystring';
import * as https from 'https';
import * as util from 'util';

import {exists, Invalid, trim, Valid, Validator} from '../validate';
import config from '../../config';

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
  config: {phone: string; msg: string},
  cb: (res: {ok: boolean; error?: any}) => void
) => void;
const sendSms: SendSms = (config, callback) => {
  const phone = [config.phone]
    .map(trim())
    .map(exists('phone is required'))
    .map(p => {
      const validateLength = (v: Valid) => {
        return v.length === 10
          ? v
          : {error: 'phone must be 10 characters long'};
      };

      return p.error ? p : validateLength(p);
    })
    .find(Boolean);
  const msg = [config.msg]
    .map(trim())
    .map(exists('message is required'))
    .map(m => {
      const validateLength = (v: Valid) => {
        return v.length <= 1600
          ? v
          : {error: 'message must be no more than 1600 characters long'};
      };

      return m.error ? m : validateLength(m);
    })
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
      protocol: 'https',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/${twilioConfig.sid}/Messages.json`,
      auth: `${twilioConfig.sid}:${twilioConfig.token}`,
      headers: {
        'Content-Type': 'application/x-www-url-form-encoded',
        'Content-length': Buffer.byteLength(stringifiedPayload),
      },
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
