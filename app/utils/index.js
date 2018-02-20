export const checkLengthArray = (arr, length) => {
  if (arr.length == length){
    return true;
  } else{
    return false;
  }
};

export const checkLengthString = (str, length) => {
  if (str.length==length){
    return true;
  } else{
    return false;
  }
  // String.prototype.length.call(str) === length
};

export const checkBuildingFace = (str) => {
  if (str==="N" || str==="S" || str==="E" || str==="W"){
    return true;
  } else{
    return false;
  }
};


export const hasProp = (obj, prop) => (
  Object.prototype.hasOwnProperty.call(obj, prop)
);

export const hasProps = (obj, props) => {
  for (let i = 0; i < props.length; i++) {
    if (!hasProp(obj, props[i])) { return false; }
  }

  return true;
};

export const inRange = (val, lowerBound, upperBound) => {
  console.log("here");
  if (val =>lowerBound && val <= upperBound){
    return true;
  } else{
    return false;
  }
};
