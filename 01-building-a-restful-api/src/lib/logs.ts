/*
 * Library for storing and rotating logs
 */
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const baseDir = path.join(__dirname, '../../../.logs');

type Append = () => void;
/*
 * Append logs to a file, create a file if one doesn't exist
 */
const append = () => {};

const logs = {};

export default logs;
