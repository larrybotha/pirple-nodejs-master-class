import * as path from 'path';

import {Handler} from '../../types';

import {createServiceRouter, getStaticAsset} from '../utils';

const contentTypeMap: {[key: string]: string} = {
  css: 'text/css',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  png: 'image/png',
  txt: 'text/plain',
};

const staticAssetsMethods: {[key: string]: Handler} = {
  get: async ({pathname}, cb) => {
    const {ext} = path.parse(pathname);

    try {
      const asset = await getStaticAsset(pathname);
      const contentType = contentTypeMap[ext.replace('.', '')] || 'text/plain';

      cb(
        200,
        /image/.test(contentType) ? asset : asset.toString('utf8'),
        contentType
      );
    } catch (err) {
      cb(500, err);
    }
  },
};

const allowedMethods = ['get'];
const staticAssetsService = createServiceRouter(
  allowedMethods,
  staticAssetsMethods
);

export {staticAssetsService};
