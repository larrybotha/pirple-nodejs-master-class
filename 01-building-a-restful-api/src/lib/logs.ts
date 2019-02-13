/*
 * Library for storing and rotating logs
 */
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import * as zlib from 'zlib';

const asyncAppendFile = promisify(fs.appendFile);
const asyncClose = promisify(fs.close);
const asyncOpen = promisify(fs.open);
const asyncWriteFile = promisify(fs.writeFile);
const asyncReadFile = promisify(fs.readFile);
const asyncReaddir = promisify(fs.readdir);
const asyncGzip = (buf: zlib.InputType): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    zlib.gzip(buf, (err, res) => {
      if (err) return reject(err);

      return resolve(res);
    });
  });
};

const baseDir = path.join(__dirname, '../../../.logs');

const getFilePath = (filename: string) => path.join(baseDir, `${filename}.log`);

/*
 * Append logs to a file, create a file if one doesn't exist
 */
type Append = (filename: string, data: string) => Promise<string>;
const append: Append = async (filename, data) => {
  const file = getFilePath(filename);
  const dataToAppend = `${data}\n`;

  try {
    const fileDescriptor = await asyncOpen(file, 'a');
    await asyncAppendFile(fileDescriptor, dataToAppend);
    await asyncClose(fileDescriptor);

    return dataToAppend;
  } catch (err) {
    throw new err();
  }
};

/*
 * Compress the contents of a single log file into a .gz.b64 file in the same directory
 */
type Compress = (logId: string, newFileId: string) => Promise<void>;
const compress: Compress = async (logId, newFileId) => {
  const sourceFileName = `${logId}.log`;
  const destFileName = `${newFileId}.gz.b64`;

  try {
    const data = await asyncReadFile(getFilePath(sourceFileName), 'utf8');
    const compressedData = await asyncGzip(data);
    // open file for writing
    const fileDescriptor = await asyncOpen(getFilePath(destFileName), 'wx');
    // write to file
    await asyncWriteFile(fileDescriptor, compressedData.toString('base64'));
    // close file once we are done with it
    await asyncClose(fileDescriptor);
  } catch (err) {
    throw err;
  }
};

/*
 * Retrieve a list of log files
 *
 * @param includeCompressedLogs {boolean} - include compressed log files in result
 * @return string[] - an array of log ids
 */
type List = (includeCompressedLogs?: boolean) => Promise<string[]>;
const list: List = async (includeCompressedLogs = false) => {
  try {
    const fileNames = await asyncReaddir(baseDir);
    const logFileIds = fileNames
      .filter(
        fn =>
          /\.log$/.test(fn) || (includeCompressedLogs && /\.gz\.b64$/.test(fn))
      )
      .map(fn => fn.replace(/\.log$/, ''))
      .map(fn => fn.replace(/\.gz\.b64/, ''));

    return logFileIds;
  } catch (err) {
    throw err;
  }
};

type Truncate = () => Promise<void>;
const truncate: Truncate = () => {};

const logs = {append, compress, list, truncate};

export default logs;
