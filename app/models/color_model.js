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
    validate: {
      validator: (hex) => (checkLengthString(hex, 7))
      },
      message: '{VALUE} is not a valid color hexcode.',
    },
  },
  rgb: {
    type: [Number],
    required: true,
    validate: {
      validator: (rgb) => {
        return  checkLengthArray(rgb, 3) && inRange(rgb[0], 0, 255) &&
        inRange(rgb[1], 0, 255) && inRange(rgb[2], 0, 255);
      },
      message: '{VALUE} is not a valid RGB color.',
    },
  },
}, {
  timestamp: true,
});

// create model class
const ColorModel = mongoose.model('Color', ColorSchema);

export default ColorModel;
