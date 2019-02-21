import * as fs from 'fs';
import {promisify} from 'util';

const asyncOpen = promisify(fs.open);
const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);
const asyncClose = promisify(fs.close);

type Create = (filePath: string, data: any) => Promise<string>;
const create: Create = async (filePath, data) => {
  try {
    const fileDescriptor = await asyncOpen(filePath, 'wx');
    await asyncWriteFile(fileDescriptor, JSON.stringify(data), 'utf8');
    await asyncClose(fileDescriptor);

    return data;
  } catch (err) {
    throw err;
  }
};

type Read = (filePath: string) => Promise<any>;
const read: Read = async filePath => {
  try {
    const fileDescriptor = await asyncOpen(filePath, 'r');
    const resultBuffer = await asyncReadFile(fileDescriptor);
    await asyncClose(fileDescriptor);

    return JSON.parse(resultBuffer.toString());
  } catch (err) {
    throw err;
  }
};

type Patch = () => Promise<string>;
type Remove = () => Promise<string>;
type Update = () => Promise<string>;

export default {
  create,
  patch,
  read,
  remove,
  update,
};
