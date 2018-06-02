import Challenge from '../models/challenge_model';
import * as Challenges from '../controllers/challenge_controller';

import config from '../config';

import { logger } from './';
import { solveLogic } from './misc';

function sortByReward({ r: r1 }, { r: r2 }) { return r1 < r2 ? -1 : r1 > r2; }

export const getCompletedChallenges = (user) => (
  Challenge.find({ _id: { $in: user.challenges } })
  .then(challenges => {
    const completed = challenges.reduce((arr, { _doc: challenge = null }) => {
      if (challenge === null) { return arr; }

      const { checkCompletion: trigger = null, _id = null } = challenge;

      if (trigger !== null && solveLogic(user, trigger)) { arr.push(_id); }

      return arr;
    }, []);

    return Promise.resolve(completed);
  })
);

export const reduceChallenges = (level, challengeIDs) => (
  Challenge.find({ level }, ['description', 'reward'])
  .then(all => {
    const strIDs = challengeIDs.map(ch => (`${ch}`));
    const challenges = all.map(
      ({ _doc: { _id, description, reward: r } }) => {
        if (strIDs.includes(`${_id}`)) {
          return { completed: false, description, r };
        }

        return { completed: true, description, r };
      },
    );

    const response = challenges.sort(sortByReward)
    .map(({ completed, description }) => ({ completed, description }));

    return Promise.resolve(response);
  })
);

async function checkChallengesUser(req) {
  const { user } = req;
  let error = null;

  user.challenges = await Challenge.find(
    { _id: { $in: user.challenges } },
    ['checkCompletion', 'description', 'reward']
  )
  .catch(e => { error = e; });

  if (error !== null) { return Promise.reject(error); }

  Object.assign(req, { user });

  return new Promise((resolve) => {
    Challenges.toggleChallenges(req, { json: resolve });
  })
  .then(({
    challenges: c = null,
    error: e = null,
    user: u = null,
    _logMsg: msg = null,
  }) => (
    new Promise(async (resolve, reject) => {
      if (c === null) {
        if (e === null) {
          reject(new EvalError(
            `unknown error occurred updating ${user.name} ${user.lastName}'s challenges`,
          ));
          return;
        }

        reject(e);
        return;
      }

      if (msg != null) {
        if (config.gameSettings.trackRunnningTime.toggleChallenges) {
          logger(`${req.method}: ${req.ip}`, 'toggleChallenges', msg);
        } else {
          logger(req.method, 'toggleChallenges', msg);
        }
      }

      const completedIDs = c.map(ch => (`${ch._id}`));

      const chArr = await reduceChallenges(
        user.level,
        user.challenges.map(ch => (ch._id))
        .filter(id => (!completedIDs.includes(`${id}`))),
      )
      .catch(err => { error = err; });

      if (error !== null) {
        reject(error);
        return;
      }

      const response = chArr.sort(sortByReward)
      .map(({ completed, description }) => ({ completed, description }));

      resolve(response);
    })
  ));
}

export const appendChallenges = async (req, res, json, fnName) => {
  const { checkChallenges = false } = json;
  const obj = Object.assign({}, json);
  let fn = null;
  let error = null;

  if (checkChallenges) {
    const { user } = req;

    delete obj.checkChallenges;

    const completed = await getCompletedChallenges(user)
    .catch(e => { error = e; });

    if (error !== null) {
      res.json({ error: { errmsg: error.message } });
      return;
    }

    if (completed.length > 0) {
      Object.assign(req, { body: { challenges: completed } });
      fn = () => (checkChallengesUser(req));
    } else {
      fn = () => (reduceChallenges(user.level, user.challenges));
    }
  }

  if (fn !== null) {
    obj.challenges = await fn().catch(e => { error = e; });

    if (error !== null) {
      res.json({ error: { errmsg: error.message } });
      return;
    }
  }

  res.json(obj);
};
