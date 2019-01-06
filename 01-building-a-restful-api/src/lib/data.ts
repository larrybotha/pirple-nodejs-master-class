import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const asyncClose = promisify(fs.close);
const asyncOpen = promisify(fs.open);
const asyncRead = promisify(fs.readFile);
const asyncTruncate = promisify(fs.truncate);
const asyncUnlink = promisify(fs.unlink);
const asyncWriteFile = promisify(fs.writeFile);

const baseDir = path.join(__dirname, '../../../.data');

const getFilePath = (base: string, dir: string, file: string) =>
  path.join(base, dir, `${file}.json`);

type Create = (
  dir: string,
  file: string,
  data: any,
  callback: (err?: string) => void
) => void;
const create: Create = async (dir, file, data, callback) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    // create the file
    // If the provided path doesn't exist, it will first need to be created
    const fileDescriptor = await asyncOpen(filePath, 'wx');
    await asyncWriteFile(fileDescriptor, JSON.stringify(data));
    await asyncClose(fileDescriptor as number);
  } catch (err) {
    callback(err);
  }
};

type Read = (
  dir: string,
  file: string,
  callback: (err?: Error, result?: string) => void
) => void;
const read: Read = async (dir, file, callback) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    const result = await asyncRead(filePath, 'utf8');

    callback(null, result);
  } catch (err) {
    callback(err);
  }
};

type Update = (
  dir: string,
  file: string,
  data: any,
  callback: (err?: string) => void
) => void;
const update: Update = async (dir, file, data, callback) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    const fileDescriptor = await asyncOpen(filePath, 'r+');
    await asyncTruncate(filePath);
    await asyncWriteFile(filePath, JSON.stringify(data));
    await asyncClose(fileDescriptor as number);
  } catch (err) {
    callback(err);
  }
};

type Delete = (
  dir: string,
  file: string,
  callback: (err: Error) => void
) => void;
const deleteFile: Delete = async (dir, file, callback) => {
  const filePath = getFilePath(baseDir, dir, file);

  try {
    await asyncUnlink(filePath);
  } catch (err) {
    callback(err);
  }
};

const lib = {create, delete: deleteFile, read, update};

export default lib;
