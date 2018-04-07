import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const CitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country',
    required: false,
  },
  centroid: {
    type: [Number],
    required: true,
  },
  bbox: {
    type: [Number],
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const CityModel = mongoose.model('City', CitySchema);

export default CityModel;
