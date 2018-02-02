import mongoose, { Schema } from 'mongoose';

import { checkLengthArray } from '../utils';

// create a schema for posts with a field
const CoordinateSchema = new Schema({
  value: {
    type: [Number],
    required: true,
    validator: (coord) => (
      checkLengthArray(coord, 2) || checkLengthArray(coord, 3)
    ),
  },
}, {
  timestamp: true,
},
);

// create model class
const CoordinateModel = mongoose.model('Coordinate', CoordinateSchema);

export default CoordinateModel;
