import { pluralize, logger } from './utils';
import * as Adders from './utils/adders';

import config from './config';

function helper(obj, arr, i, resolve, reject) {
  const model = arr[i];

  let path = `${__dirname}/data/`;

  if (model === 'Building') {
    path += 'cities';
  } else {
    path += pluralize(model.toLowerCase());
  }

  const fn = Adders[`add${pluralize(model)}`];

  if (fn) {
    fn(path, obj).then((res = null) => {
      const update = Object.assign({}, obj);

      update[model] = res;

      if (i < arr.length - 1) {
        helper(update, arr, i + 1, resolve, reject);
      } else {
        resolve();
      }
    })
    .catch(error => { reject(error); });
  } else if (i < arr.length - 1) {
    helper(obj, arr, i + 1, resolve, reject);
  } else {
    resolve();
  }
}

function startInsertion(arr) {
  return new Promise((resolve, reject) => {
    helper({}, arr, 0, resolve, reject);
  });
}

export default (collections) => (new Promise((resolve, reject) => {
  const { length: n } = collections;

  config.timers.clearAll();

  logger(
    'DB_INIT_STRT',
    'init_script',
    `Initializing collection${n === 1 ? '' : 's'} ${collections.map(s => (`'${s}'`)).join(', ')}.`,
  );

  startInsertion(collections)
  .then(res => { resolve(); })
  .catch(error => { reject(error); });
}));
