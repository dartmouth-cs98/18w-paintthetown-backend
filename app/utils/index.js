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
