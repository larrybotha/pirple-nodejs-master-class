/*
 * Library for storing and rotating logs
 */
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import * as zlib from 'zlib';

const asyncOpen = promisify(fs.open);
const asyncClose = promisify(fs.close);
const asyncAppendFile = promisify(fs.appendFile);

const baseDir = path.join(__dirname, '../../../.logs');

const getFilePath = (filename: string) => path.join(baseDir, `${filename}.log`);

type Append = (filename: string, data: string) => Promise<string>;
/*
 * Append logs to a file, create a file if one doesn't exist
 */
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

const logs = {append};

export default logs;
