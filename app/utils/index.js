export const checkLengthArray = (arr, length) => (arr.length === length);

export const checkLengthString = checkLengthArray;

export const checkBuildingFace = (str) => (
  str === 'N' || str === 'S' || str === 'E' || str === 'W'
);


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
