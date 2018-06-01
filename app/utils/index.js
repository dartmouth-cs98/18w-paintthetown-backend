export const MAX_FN_CALLS = 10;

export const printStats = (fn, calls) => {
  const { length: n } = calls;

  const rate = calls.reduce((r, { start, end }) => (r + end - start), 0) / n;

  console.log(`${fn}: average speed: ${rate} ms.`);
  console.log(`${fn}: average rate: ${MAX_FN_CALLS / (calls[n - 1].end - calls[0].start) * 1000} cps.`);
};

export const checkLengthArray = (arr, length) => (arr.length === length);

export const checkLengthString = checkLengthArray;

export const checkBuildingFace = (str) => (
  str === 'N' || str === 'S' || str === 'E' || str === 'W'
);

export const contains = (a, v) => (typeof a.find(e => e === v) !== 'undefined');

export const jsonQuickSort = (json, sortFn = null) => {
  let { _doc: obj = null } = json;

  if (obj === null) { obj = json; }

  const keys = Object.keys(obj);

  if (sortFn === null) {
    keys.sort();
  } else {
    keys.sort(sortFn);
  }

  return keys.reduce((o, key) => {
    const newProp = {};

    newProp[key] = obj[key];

    return Object.assign(o, newProp);
  }, {});
};


export const functionCalls = {};

export const hasProp = (obj, prop) => (
  Object.prototype.hasOwnProperty.call(obj, prop)
);

export const hasProps = (obj, props) => {
  for (let i = 0; i < props.length; i++) {
    if (!hasProp(obj, props[i])) { return false; }
  }

  return true;
};

export const inRange = (val, lB, uB) => (val >= lB && val <= uB);

export const deltaEncode = (vals, delta) => {
  const keys = delta.slice();

  Object.keys(vals[0]).forEach(key => {
    let sameKey = false;

    for (let i = 0; i < delta.length; i += 1) {
      if (delta[i] === key) {
        sameKey = true;
        break;
      }
    }

    if (!sameKey) { keys.push(key); }
  });

  const data = vals.map(entry => (keys.map(key => (entry[key]))));
  const out = { keys, delta };

  data.sort((a, b) => {
    if (a[0] > b[0]) {
      return 1;
    }

    if (a[0] < b[0]) {
      return -1;
    }

    return 0;
  });

  console.log(data);

  const last = delta.map(v => (0));
  const avg = delta.map(v => (0));

  const newVals = data.map((entry, i) => (
    entry.map((val, j) => {
      if (j < delta.length) {
        const newVal = val - last[j];
        last[j] = val;

        if (i > 1) { avg[j] += val; }

        return newVal;
      }

      return val;
    })
  ));

  out.avg = avg.map((val) => (val / data.length));
  out.vals = newVals.map((entry, i) => (
    entry.map((val, j) => {
      if (j < delta.length) { return val / out.avg[j]; }

      return val;
    })
  ));


  return JSON.stringify(out);
};

export const maxIndex = (arr) => {
  if (arr.length === 0) { return -1; }

  let maxI = 0;

  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > arr[maxI]) { maxI = i; }
  }

  return maxI;
};

export const minIndex = (arr) => {
  if (arr.length === 0) { return -1; }

  let minI = 0;

  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] < arr[minI]) { minI = i; }
  }

  return minI;
};

export const pluralize = (label) => {
  const { length: n } = label;
  const last = label.charAt(n - 1);

  if (last === 'y') { return `${label.substring(0, n - 1)}ies`; }

  return `${label}s`;
};
