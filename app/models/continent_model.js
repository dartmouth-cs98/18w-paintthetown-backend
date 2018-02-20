import mongoose, { Schema } from 'mongoose';

import Coordinate from './coordinate_model';

// create a schema for posts with a field
const ContinentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  centroid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Coordinate',
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const ContinentModel = mongoose.model('Continent', ContinentSchema);

export default ContinentModel;
