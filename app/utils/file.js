import fs from 'fs';

export const getFilesInPath = (path) => (
  new Promise((resolve, reject) => {
    fs.readdir(path, (err, dir) => {
      if (err) { return reject(err); }

      return resolve(dir);
    });
  })
);

export const readJSON = (filename) => (
  new Promise((resolve, reject) => {
    fs.readFile(filename, (err, bytes) => {
      if (err) { return reject(err); }
      return resolve(JSON.parse(bytes));
    });
  })
);

export const addData = (filename, handler, logger) => (
  new Promise((resolve, reject) => {
    readJSON(filename)
    .then(objects => {
      Promise.all(objects.map(handler))
      .then(res => {
        logger(objects);
        resolve();
      })
      .catch(error => { reject(error); });
    })
    .catch(error => { reject(error); });
  })
);
