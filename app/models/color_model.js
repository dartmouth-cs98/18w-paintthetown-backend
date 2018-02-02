import mongoose, { Schema } from 'mongoose';

import { checkLengthString, checkLengthArray, inRange } from '../utils';

// create a schema for posts with a field
const ColorSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  hex: {
    type: String,
    required: true,
    validator: (hex) => (checkLengthString(hex, 7)),
  },
  rgb: {
    type: [Number],
    required: true,
    validator: (rgb) => (
      checkLengthArray(rgb, 3) && inRange(rgb[0], 0, 255) &&
      inRange(rgb[1], 0, 255) && inRange(rgb[2], 0, 255)
    ),
  },
}, {
  timestamp: true,
});

// create model class
const ColorModel = mongoose.model('Color', ColorSchema);

export default ColorModel;
