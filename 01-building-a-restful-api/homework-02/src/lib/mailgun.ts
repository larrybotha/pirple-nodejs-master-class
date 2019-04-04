import * as https from 'https';
import * as querystring from 'querystring';

import {config} from '../config';
import {createRequest} from '../helpers/create-request';

const {mailGun} = config.apis;
const {apiKey, secretKey} = mailGun;
const mailGunDomain = process.env.MAILGUN_DOMAIN;

const getMailGunPath = (path: string) => `/v3/${mailGunDomain}/${path}`;

const baseRequestOptions: https.RequestOptions = {
  headers: {
    Authorization: `Basic ${Buffer.from(`api:${secretKey}`).toString(
      'base64'
    )}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  hostname: 'api.mailgun.net',
  method: 'POST',
  protocol: 'https:',
};

type SendEmail = (options: {
  body: string;
  email: string;
  subject: string;
}) => Promise<void>;
/**
 * sendEmail
 *
 * @param {string} email - the email address to send the mail to
 * @returns {object} - response failure or success
 */
const sendEmail: SendEmail = async ({body, email, subject, ...rest}) => {
  const payload = {
    from: process.env.MAILGUN_TEST_EMAIL,
    subject,
    text: body,
    to: email,
  };
  const requestOptions: https.RequestOptions = {
    ...baseRequestOptions,
    path: getMailGunPath('messages'),
  };

  try {
    await createRequest(requestOptions, querystring.stringify(payload));
  } catch (err) {
    throw err;
  }
};

export {sendEmail};
