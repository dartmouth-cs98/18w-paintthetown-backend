import { Router } from 'express';

import { hasProp } from './';

function awaitJson(fn, req, j, fnName) {
  return new Promise((json) => { fn(req, { json }, j, fnName); });
}

export const solveLogic = (data, q) => {
  const [type, op, ...rest] = q;

  if (rest.length < 2) { return false; }

  const [var1, val1, ...etc] = rest;
  let bool = null;

  switch (op) {
    case 2: bool = data[var1] > val1; break;
    case 1: bool = data[var1] >= val1; break;
    case -1: bool = data[var1] <= val1; break;
    case -2: bool = data[var1] < val1; break;
    default: bool = data[var1] === val1;
  }

  if (etc.length > 0) {
    if (type === 'OR') { return bool || solveLogic(etc); }

    return bool && solveLogic(etc);
  }

  return bool;
};

export const sortModels = (a, b) => {
  if (a === b) { return 0; }

  switch (a) {
    case 'Color': case 'Challenge': return -1;
    case 'Team': return -1 + (b === 'Color') * 2;
    case 'City': return 1 - (b === 'Building') * 2;
    default: return 1 - 2 * (a === 'City' && b === 'Building');
  }
};

function argsGenerator(arr, passThru, type) {
  return arr.map(({ handle, auth = null }) => {
    const fn = functionGenerator(handle, passThru, type);

    if (auth === null) { return [fn]; }

    return [auth, fn];
  });
}

function functionGenerator(handle, passThru, type) {
  if (type === 'before') {
    return Object.defineProperty((req, res) => {
      awaitJson(passThru, req, {}, handle.name)
      .then(json => { handle(req, res, json, handle.name); })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });
    }, 'name', { value: handle.name });
  }

  return Object.defineProperty((req, res) => {
    awaitJson(handle, req, {}, handle.name)
    .then(json => { passThru(req, res, json, handle.name); })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }, 'name', { value: handle.name });
}

export const routerPassthrough = (router, passThru, type) => {
  if (type !== 'before' && type !== 'after') { return null; }

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
      const args = argsGenerator(get, passThru, type);
      curr.get(...args);
    }

    if (post !== null) {
      const args = argsGenerator(post, passThru, type);
      curr.post(...args);
    }
  });

  return r;
};
