import User from './models/user_model';
import Challenge from './models/challenge_model';

import { getFilesInPath } from './utils/file';
import { addCity, addTeams, addChallenges, LEVEL_REGEX } from './utils/adders';

import config from './config';

export default (collections) => (new Promise((resolve, reject) => {
  const users = config.adminData.map((data) => (
    new User(Object.assign({}, data, { role: 'admin', typeOfLogin: 'email' })))
  );

  config.timers.clearAll();

  getFilesInPath(`${__dirname}/data/`)
  .then(dirs => (
    Promise.all(dirs.map(dir => (
      new Promise((resolve1, reject1) => {
        const path = `${__dirname}/data/${dir}`;

        getFilesInPath(path)
        .then(jsonFiles => {
          if (dir === 'cities') {
            return Promise.all(jsonFiles.map(city => (addCity(city, path))))
            .then(res => { resolve1(res); })
            .catch(err => { reject1(err); });
          }

          if (dir === 'teams') {
            return addTeams(jsonFiles, path)
            .then(res => { resolve1(res); })
            .catch(err => { reject1(err); });
          }

          if (dir === 'challenges') {
            let level1Challenges = [];

            return Promise.all(jsonFiles.map(level => (
              addChallenges(level, path)
              .then(() => (Challenge.find({
                level: parseInt(LEVEL_REGEX.exec(level)[1], 10),
              }, ['_id'])))
              .then(challenges => {
                if (parseInt(LEVEL_REGEX.exec(level)[1], 10) === 1) {
                  level1Challenges = challenges;
                }
              })
            )))
            .then(() => {
              users.forEach(user => {
                Object.assign(user, { challenges: level1Challenges });
              });
              resolve1();
            })
            .catch(err => { reject1(err); });
          }

          return reject1(new EvalError(`unknown data type '${dir}'`));
        })
        .catch(error => { reject1(error); });
      })
    )))
  ))
  .then(res => (Promise.all(users.map(user => (user.save())))))
  .then(res => {
    console.log(`\t•Added ${res.length} user${res.length === 1 ? '' : 's'}.`);
    resolve();
  })
  .catch(error => { reject(error); });
}));
