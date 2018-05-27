import { Router } from 'express';

import { hasProp, jsonQuickSort } from './';

import Challenge from '../models/challenge_model';
import * as Challenges from '../controllers/challenge_controller';

const DEFAULT_PASSTHROUGH_NAME = 'passThru';

function awaitJson(fn, req) {
  return new Promise((json) => { fn(req, { json }); });
}

function solveLogic(user, q) {
  const [type, op, ...rest] = q;

  if (rest.length < 2) { return false; }

  const [var1, val1, ...etc] = rest;
  let bool = null;

  switch (op) {
    case 2: bool = user[var1] > val1; break;
    case 1: bool = user[var1] >= val1; break;
    case -1: bool = user[var1] <= val1; break;
    case -2: bool = user[var1] < val1; break;
    default: bool = user[var1] === val1;
  }

  if (etc.length > 0) {
    if (type === 'OR') { return bool || solveLogic(etc); }

    return bool && solveLogic(etc);
  }

  return bool;
}

export const appendChallenges = (req, res, json) => {
  const { checkChallenges = false, challenges } = json;

  if (checkChallenges) {
    const { user } = req;
    const obj = Object.assign({}, json);

    delete obj.checkChallenges;

    const completed = challenges.reduce((arr, { _doc: challenge = null }) => {
      if (challenge === null) { return arr; }

      const { checkCompletion: trigger = null, _id = null } = challenge;

      if (trigger !== null && solveLogic(user, trigger)) { arr.push(_id); }

      return arr;
    }, []);

    if (completed.length > 0) {
      Object.assign(req, { body: { challenges: completed } });

      new Promise((resolve) => {
        Challenges.toggleChallenges(req, { json: resolve });
      })
      .then(({ challenges: c = null, error = null, user: u = null }) => {
        if (c === null) {
          if (error === null) {
            res.json({ error: { errmsg: `unknown error occurred updating ${user.name} ${user.lastName}'s challenges` } });
          } else {
            res.json({ error });
          }
        } else {
          const $nin = c.map(ch => (ch._id));

          Challenge.find({ level: u.level, _id: { $nin } })
          .then(arr => {
            obj.challenges = [
              ...c.map(ch => ({
                description: ch.description,
                completed: true,
              })),
              ...arr.map(ch => ({
                description: ch.description,
                completed: false,
              })),
            ];
            res.json(jsonQuickSort(obj));
          })
          .catch(err => { res.json({ error: { errmsg: err.message } }); });
        }
      })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });
      return;
    }

    Challenge.find({ level: user.level, _id: { $nin: user.challenges } })
    .then(arr => {
      obj.challenges = [
        ...arr.map(ch => ({
          description: ch.description,
          completed: true,
        })),
        ...user.challenges.map(ch => ({
          description: ch.description,
          completed: false,
        })),
      ];

      res.json(jsonQuickSort(obj));
    })
    .catch(err => { res.json({ error: { errmsg: err.message } }); });
    return;
  }

  res.json(jsonQuickSort(json));
};

export const routerPassthrough = (
  router,
  passThru,
  fnName = DEFAULT_PASSTHROUGH_NAME,
) => {
  const r = Router();
  const { stack: s } = router;

  s.forEach(layer => {
    const { route: { path, stack } } = layer;
    const curr = r.route(path);
    const methods = {};

    for (let i = 0; i < stack.length; i += 2) {
      const functions = stack.slice(i, i + 2);

      functions.forEach((fn, j) => {
        const { method, handle } = fn;

        if (j === 0) {
          if (!hasProp(methods, method)) { methods[method] = []; }

          methods[method].push({ handle });
        } else {
          const { length: n } = methods[method];

          methods[method][n - 1] = {
            handle,
            auth: methods[method][n - 1].handle,
          };
        }
      });
    }

    const { get = null, post = null } = methods;

    if (get !== null) {
      const args = get.map(({ handle, auth = null }) => {
        const fn = Object.defineProperty((req, res) => {
          awaitJson(handle, req, res)
          .then(json => { passThru(req, res, json); })
          .catch(error => { res.json({ error: { errmsg: error.message } }); });
        }, 'name', { value: fnName });

        if (auth === null) { return [fn]; }

        return [auth, fn];
      });

      curr.get(...args);
    }

    if (post !== null) {
      const args = post.map(({ handle, auth = null }) => {
        const fn = Object.defineProperty((req, res) => {
          awaitJson(handle, req, res)
          .then(json => { passThru(req, res, json); })
          .catch(error => { res.json({ error: { errmsg: error.message } }); });
        }, 'name', { value: fnName });

        if (auth === null) { return [fn]; }

        return [auth, fn];
      });

      curr.post(...args);
    }
  });

  return r;
};
