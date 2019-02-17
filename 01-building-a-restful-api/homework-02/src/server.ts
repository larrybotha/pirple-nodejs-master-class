import * as http from 'http';
import * as https from 'https';

enum ServerTypes {
  http = 'http',
  https = 'https',
}
interface ServerOptions {
  port: number;
}

type StartServer = (type: ServerTypes, options: ServerOptions) => void;
const createServer: StartServer = (type, options) => {
  const createServer = type === 'http' ? http.createServer : https.createServer;
  const server = createServer(options, (req, res) => {});
};

const startServers = () => {};

exports.module = {startServers};
