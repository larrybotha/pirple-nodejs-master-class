require('dotenv').config();
const {POSTMAN_API_KEY} = process.env;

module.exports = {
  collection: `https://api.getpostman.com/collections/3615879-8b3a821b-2a4b-49fd-bed1-b0e165772a42?apikey=${POSTMAN_API_KEY}`,
  environment: `https://api.getpostman.com/environments/3615879-1e1579bb-4950-44ed-8f02-cd8f9aeb6ec6?apikey=${POSTMAN_API_KEY}`,
  reporters: ['cli'],
};
