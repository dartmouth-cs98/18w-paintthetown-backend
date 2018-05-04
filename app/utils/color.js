function decToHex(val) {
  let hex = parseInt(val, 10).toString(16);

  while (hex.length < 2) { hex = `0${hex}`; }

  return hex;
};

export const rgbToHex = (rgb) => (`#${rgb.map(v => (decToHex(v))).join('')}`);

export const hexToRgb = (hex) => (
  [1, 3, 5].map(i => (parseInt(hex.substring(i, i + 2), 16)))
);

export const rgbToHsl = (rgb) => {
  const normal = rgb.map(val => (val / 255.0));
  let maxI = 0;
  let minVal = normal[0];

  for (let i = 1; i < normal.length; i += 1) {
    if (normal[i] > normal[maxI]) { maxI = i; }
    if (normal[i] < minVal) { minVal = normal[i]; }
  }

  const maxVal = normal[maxI];

  // determine luminance
  const l = (maxVal + minVal) / 2.0;
  let s = 0;
  let h = 0;

  if (maxVal !== minVal) {
    // determine saturation
    if (l <= 0.5) {
      s = (maxVal - minVal) / (maxVal + minVal);
    } else {
      s = (maxVal - minVal) / (2.0 - maxVal - minVal);
    }

    // determine hue
    if (maxI === 0) {
      h = normal[1] - normal[2];
    } else if (maxI === 1) {
      h = normal[2] - normal[0];
    } else {
      h = normal[0] - normal[1];
    }

    h /= maxVal - minVal;

    if (maxI === 1) {
      h += 2;
    } else if (maxI === 2) {
      h += 4;
    }

    h *= 60;

    if (h < 0) { h += 360; }
  }

  return [
    h,
    Math.round(s * 100) / 100.0,
    Math.round(l * 100) / 100.0,
  ];
};

export const hslToRgb = (hsl) => {
  const [h, s, l] = hsl;

  if (s === 0) { return hsl.map(v => (l * 255.0)) }

  const temp1 = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  const temp2 = 2.0 * l - temp1;
  const hue = h / 360.0;
  const rgb = hsl.map((v, i) => {
    let temp = hue;
    let val = temp2;

    if (i % 2 === 0) {
      temp += (i - 2 < 0 ? 1 : -1) / 3.0;
    }

    if (temp > 1) {
      temp -= 1;
    } else if (temp < 0) {
      temp += 1;
    }

    if (6 * temp < 1) {
      val += (temp1 - temp2) * 6.0 * temp;
    } else if (2 * temp < 1) {
      val = temp1;
    } else if (3 * temp < 2) {
      val += (temp1 - temp2) * (4.0 - 6.0 * temp);
    }

    return val * 255.0;
  });

  return rgb.map(v => (parseInt(v, 10)));
};

export const avgHslFromHsl = (hslVals) => {
  const { length: n } = hslVals;
  let hue = 0;
  let sat = 0;
  let lum = 0;

  hslVals.forEach((el, i) => {
    const [h, s, l] = el;
    const reverseDirec = i > 0 && Math.abs(hue - h) > 180;
    let direction = null;

    if (reverseDirec) {
      if (hue < h) {
        direction = 'left';
      } else {
        direction = 'right';
      }
    }

    hue *= i;
    hue += h;

    if (reverseDirec) {
      if (direction === 'left') {
        hue -= 360;
      } else {
        hue += 360;
      }
    }

    hue /= i + 1;

    if (hue < 0) {
      hue += 360;
    } else if (hue > 360) {
      hue %= 360;
    }

    sat += s;
    lum += l;
  });

  sat /= n;
  lum /= n;

  return [hue, sat, lum];
};

export const avgHslFromRgb = (rgbVals) => {
  const hslVals = rgbVals.map(rgb => (rgbToHsl(rgb)));

  return avgHslFromHsl(hslVals);
};

export const avgRgbFromHsl = (hslVals) => {
  return avgHslFromHsl(hslVals).map(hsl => (hslToRgb(hsl)));
};

export const avgRgbFromRgb = (rgbVals) => {
  return avgRgbFromHsl(rgbVals.map(rgb => (rgbToHsl)));
};
