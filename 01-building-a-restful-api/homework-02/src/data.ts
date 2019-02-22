import * as fs from 'fs';
import {debuglog, promisify} from 'util';

const debug = debuglog('data');

const asyncAccess = promisify(fs.access);
const asyncOpen = promisify(fs.open);
const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);
const asyncClose = promisify(fs.close);
const asyncFtruncate = promisify(fs.ftruncate);
const asyncUnlink = promisify(fs.unlink);

type Create = (filePath: string, data: any) => Promise<string>;
const create: Create = async (filePath, data) => {
  try {
    const fileDescriptor = await asyncOpen(filePath, 'wx');
    await asyncWriteFile(fileDescriptor, JSON.stringify(data), 'utf8');
    await asyncClose(fileDescriptor);

    return data;
  } catch (err) {
    debug(err);
    throw err;
  }
};

type Read = (filePath: string) => Promise<any>;
const read: Read = async filePath => {
  try {
    const fileDescriptor = await asyncOpen(filePath, 'r');
    const resultBuffer = await asyncReadFile(fileDescriptor);
    await asyncClose(fileDescriptor);

    return JSON.parse(resultBuffer.toString('utf8'));
  } catch (err) {
    debug(err);
    throw err;
  }
};

type Patch = (filePath: string, data: object) => Promise<any>;
const patch: Patch = async (filePath, data) => {
  try {
    const fd = await asyncOpen(filePath, 'r+');
    const fileData = await asyncReadFile(fd);
    const newData = {...JSON.parse(fileData.toString()), ...data};

    await asyncFtruncate(fd, 0);
    await asyncWriteFile(fd, JSON.stringify(newData));
    await asyncClose(fd);

    return newData;
  } catch (err) {
    debug(err);
    throw err;
  }
};

type Remove = (filePath: string) => Promise<boolean>;
const remove: Remove = async filePath => {
  try {
    await asyncAccess(filePath, fs.constants.F_OK);
    await asyncUnlink(filePath);

    return true;
  } catch (err) {
    debug(err);
    return true;
  }
};

type Update = (filePath: string, data: object) => Promise<any>;
const update: Update = async (filePath, data) => {
  try {
    const fd = await asyncOpen(filePath, 'r+');

    await asyncFtruncate(fd, 0);
    await asyncWriteFile(fd, JSON.stringify(data));
    await asyncClose(fd);

    return data;
  } catch (err) {
    debug(err);
    throw err;
  }
};

export {create, patch, read, remove, update};
