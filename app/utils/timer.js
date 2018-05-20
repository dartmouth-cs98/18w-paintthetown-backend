import { hasProp } from '.';

class Timer {
  constructor(msg, callback, interval, cancelCondition = null) {
    this._n = interval;
    this._timer = setInterval(() => {
      callback(this);
      this._start = Date.now();
    }, this._n);
    this._start = Date.now();
    this._cancel = (...args) => (
      cancelCondition !== null && cancelCondition(this._timer, ...args)
    );

    if (msg !== null) { console.log(`TIMER_STRT:\t${msg}.`); }
  }

  timeLeft() {
    if (this._start === null) { return null; }

    return Math.abs(this._start + this._n - Date.now());
  }

  checkCancel(...args) {
    return this._cancel(...args);
  }

  cancel(msg = null) {
    this._start = null;
    this._timer = null;
    this._n = null;
    clearInterval(this._timer);

    if (msg !== null) { console.log(`TIMER_CLR:\t${msg}.`); }
  }
}

class Timers {
  constructor() {
    this._timers = {};
    this.length = 0;
  }

  addTimer(key, msg = null, ...args) {
    if (hasProp(this._timers, key)) { return false; }

    this._timers[key] = new Timer(msg, ...args);

    return true;
  }

  timeLeft(key) {
    if (!hasProp(this._timers, key)) { return null; }

    return this._timers[key].timeLeft();
  }

  cancel(key, msg = null) {
    if (!hasProp(this._timers, key)) { return; }

    this._timers[key].cancel(msg);
    delete this._timers[key];
  }

  hasKey(key) {
    return hasProp(this._timers, key);
  }

  cancelConditional(key, msg = null, ...args) {
    if (!hasProp(this._timers, key)) { return false; }

    const timer = this._timers[key];

    if (timer.checkCancel(...args)) {
      this.timers.cancel(key, msg);
      return true;
    }

    return false;
  }
}

export default Timers;
