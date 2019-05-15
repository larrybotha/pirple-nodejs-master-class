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
const asyncTruncate = promisify(fs.truncate);
const asyncGzip = (buf: zlib.InputType): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    zlib.gzip(buf, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });
};
const asyncUnzip = (buf: zlib.InputType): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    zlib.unzip(buf, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });
};

const baseDir = path.join(__dirname, '../../../.logs');

const getFilePath = (logId: string, isGzip?: boolean) => {
  const ext = isGzip ? 'gz.b64' : 'log';

  return path.join(baseDir, `${logId}.${ext}`);
};

/*
 * Append logs to a file, create a file if one doesn't exist
 */
type Append = (logId: string, data: string) => Promise<string>;
const append: Append = async (logId, data) => {
  const filePath = getFilePath(logId);
  const dataToAppend = `${data}\n`;

  try {
    const fileDescriptor = await asyncOpen(filePath, 'a');
    await asyncAppendFile(fileDescriptor, dataToAppend);
    await asyncClose(fileDescriptor);

    return dataToAppend;
  } catch (err) {
    throw err;
  }
};

/*
 * Compress the contents of a single log file into a .gz.b64 file in the same directory
 */
type Compress = (logId: string, newFileId: string) => Promise<void>;
const compress: Compress = async (logId, newFileId) => {
  const sourceFileName = getFilePath(logId);
  const destFileName = getFilePath(newFileId, true);

  try {
    const data = await asyncReadFile(sourceFileName, 'utf8');
    const compressedData = await asyncGzip(data);
    // open file for writing
    const fileDescriptor = await asyncOpen(destFileName, 'wx');
    // write to file
    await asyncWriteFile(fileDescriptor, compressedData.toString('base64'));
    // close file once we are done with it
    await asyncClose(fileDescriptor);
  } catch (err) {
    throw err;
  }
};

/*
 * Decompress the contents of a .gz.b64 file
 */
type Decompress = (fileId: string) => Promise<string>;
const decompress: Decompress = async fileId => {
  const file = getFilePath(fileId, true);

  try {
    const compressedStr = await asyncReadFile(file, 'utf8');
    const inputBuffer = Buffer.from(compressedStr, 'base64');
    const resultBuffer = await asyncUnzip(inputBuffer);

    return resultBuffer.toString();
  } catch (err) {
    throw err;
  }
};

/*
 * Retrieve a list of log file ids
 *
 * @param includeCompressedLogs {boolean} - include compressed log files in result
 * @return logFiles {string[]} - an array of log filenames
 */
type List = (includeCompressedLogs?: boolean) => Promise<string[]>;
const list: List = async (includeCompressedLogs = false) => {
  try {
    const fileNames = await asyncReaddir(baseDir);
    const logFiles = fileNames.filter(
      fn =>
        /\.log$/.test(fn) || (includeCompressedLogs && /\.gz\.b64$/.test(fn))
    );

    return logFiles;
  } catch (err) {
    throw err;
  }
};

type Truncate = (logId: string) => Promise<void>;
const truncate: Truncate = async logId => {
  const filePath = getFilePath(logId);

  try {
    await asyncTruncate(filePath, 0);
  } catch (err) {
    throw err;
  }
};

const logs = {append, compress, decompress, list, truncate};

export default logs;
