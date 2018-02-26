import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  tags: {
    type: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Tag',
    }],
    default: [],
  },
  centroid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Coordinate',
    required: true,
  },
  baseAltitude: {
    type: Number,
    required: true,
  },
  topAltitude: {
    type: Number,
    required: true,
  },
  polyhedron: {
    type: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Coordinate',
    }],
    required: true,
  },
  city: {
    type: mongoose.Schema.ObjectId,
    ref: 'City',
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const BuildingModel = mongoose.model('Building', BuildingSchema);

export default BuildingModel;
