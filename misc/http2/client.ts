import * as http2 from 'http2';

const client = http2.connect('http://localhost:6000');

const req = client.request({
  ':path': '/',
});

let str = '';

req.on('data', chunk => (str += chunk));

req.on('end', () => {
  console.log(str);
});

req.end();
