import {Handler} from '../types';

import {createServiceRouter, getStaticAsset} from './utils';

const contentTypeMap: {[key: string]: string} = {
  css: 'text/css',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  png: 'image/png',
  txt: 'text/plain',
};

const staticAssetsMethods: {[key: string]: Handler} = {
  get: async ({pathname}, cb) => {
    const ext = pathname
      .split('.')
      .reverse()
      .find(Boolean);

    try {
      const staticAssets = await getStaticAsset(pathname);

      cb(200, staticAssets, contentTypeMap[ext] || 'text/plain');
    } catch (err) {
      debugger;
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
