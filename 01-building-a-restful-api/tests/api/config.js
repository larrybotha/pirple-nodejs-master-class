require('dotenv').config();
const {POSTMAN_API_KEY} = process.env;

const POSTMAN_COLLECTION_ID = '3615879-8b3a821b-2a4b-49fd-bed1-b0e165772a42';
const POSTMAN_ENV_ID = '3615879-1e1579bb-4950-44ed-8f02-cd8f9aeb6ec6';

const buildUrl = (endpoint, id) =>
  `https://api.getpostman.com/${endpoint}/${id}?apikey=${POSTMAN_API_KEY}`;

const collection = buildUrl('collections', POSTMAN_COLLECTION_ID);
const environment = buildUrl('environments', POSTMAN_ENV_ID);

module.exports = {
  collection,
  environment,
  // reporters: ['progress'],
};
