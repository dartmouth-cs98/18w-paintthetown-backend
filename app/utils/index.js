export const checkLengthArray = (arr, length) => (
  Array.prototype.length.call(arr) === length
);

export const checkLengthString = (str, length) => (
  String.prototype.length.call(str) === length
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
