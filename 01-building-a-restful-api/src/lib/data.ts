import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

import {parseJsonToObject} from './helpers';

const asyncClose = promisify(fs.close);
const asyncOpen = promisify(fs.open);
const asyncRead = promisify(fs.readFile);
const asyncTruncate = promisify(fs.truncate);
const asyncUnlink = promisify(fs.unlink);
const asyncWriteFile = promisify(fs.writeFile);

const baseDir = path.join(__dirname, '../../../.data');

const getFilePath = (base: string, dir: string, file: string) =>
  path.join(base, dir, `${file}.json`);

type Create = (dir: string, file: string, data: any) => Promise<any>;
const create: Create = async (dir, file, data) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    // create the file
    // If the provided path doesn't exist, it will first need to be created
    const fileDescriptor = await asyncOpen(filePath, 'wx');
    await asyncWriteFile(fileDescriptor, JSON.stringify(data));
    await asyncClose(fileDescriptor as number);

    return data;
  } catch (err) {
    throw err;
  }
};

type Read = (dir: string, file: string) => Promise<any>;
const read: Read = async (dir, file) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    const result = await asyncRead(filePath, 'utf8');

    return parseJsonToObject(result);
  } catch (err) {
    throw err;
  }
};

type Update = (dir: string, file: string, data: any) => Promise<any>;
const update: Update = async (dir, file, data) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    const fileDescriptor = await asyncOpen(filePath, 'r+');
    await asyncTruncate(filePath);
    await asyncWriteFile(filePath, JSON.stringify(data));
    await asyncClose(fileDescriptor as number);

    return data;
  } catch (err) {
    throw err;
  }
};

type Patch = (dir: string, file: string, data: any) => Promise<any>;
const patch: Patch = async (dir, file, data) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    const fileDescriptor = await asyncOpen(filePath, 'r+');
    const fileData = await read(dir, file);
    const newData = {...fileData, ...data};
    await asyncTruncate(filePath);
    await asyncWriteFile(filePath, JSON.stringify(newData));
    await asyncClose(fileDescriptor as number);

    return newData;
  } catch (err) {
    throw err;
  }
};

type Delete = (dir: string, file: string) => Promise<void>;
const deleteFile: Delete = async (dir, file) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    await asyncUnlink(filePath);
  } catch (err) {
    throw err;
  }
};

const lib = {create, delete: deleteFile, patch, read, update};

export default lib;
