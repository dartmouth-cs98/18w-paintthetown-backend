import { Router } from 'express';

import { hasProp } from './';

const DEFAULT_PASSTHROUGH_NAME = 'passThru';

function awaitJson(fn, req) {
  return new Promise((json) => { fn(req, { json }); });
}

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
