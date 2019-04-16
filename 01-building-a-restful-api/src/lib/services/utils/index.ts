import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

import {Handler} from '../../types';

import config from '../../../config';

const {viewGlobals} = config;
const asyncReadFile = promisify(fs.readFile);

type CreateServiceRouter = (
  allowedMethods: string[],
  serviceHandlers: {[key: string]: Handler},
  contentType?: string
) => Handler;

const createServiceRouter: CreateServiceRouter = (
  allowedMethods,
  serviceHandlers,
  contentType = 'application/json'
) => (data, cb) => {
  const {method} = data;
  const serviceHandler: Handler | undefined = serviceHandlers[method];

  if (serviceHandler) {
    serviceHandler(data, cb);
  } else {
    cb(405, undefined, contentType);
  }
};

const viewVarReplacer = (data: {[key: string]: any}) => (
  match: string
): string => {
  const keys = match.replace(/^{|}$/g, '').split('.');
  const value = keys.reduce((acc, key) => acc[key], data);

  return value;
};

type InterpolateViewVars = (view: string, data: object) => string;
const interpolateViewVars: InterpolateViewVars = (view, data) => {
  const viewData = {...data, global: {...viewGlobals}};

  return view.replace(/{\w*(\.\w*)?}/g, viewVarReplacer(viewData));
};

type GetWrappedView = (
  view: string,
  viewData: {[key: string]: any},
  viewPath: string
) => Promise<string>;
const getWrappedView: GetWrappedView = async (view, viewData, viewPath) => {
  const partialsPath = path.resolve(viewPath, 'partials');
  const [header, footer] = await Promise.all([
    asyncReadFile(path.join(partialsPath, '_header.html'), 'utf8'),
    asyncReadFile(path.join(partialsPath, '_footer.html'), 'utf8'),
  ]);
  const viewContents = [header, view, footer].join('');

  return interpolateViewVars(viewContents, viewData);
};

type GetView = (
  viewName: string,
  viewData: {[key: string]: any},
  viewPath?: string
) => Promise<string>;
const getView: GetView = async (
  viewName,
  viewData,
  viewPath = '../../../views'
) => {
  const basePath = path.resolve(__dirname, viewPath);
  const viewFile = path.join(basePath, `${viewName}.html`);
  const viewContents = await asyncReadFile(viewFile, 'utf8');

  return getWrappedView(viewContents, viewData, basePath);
};

export {createServiceRouter, getView};
