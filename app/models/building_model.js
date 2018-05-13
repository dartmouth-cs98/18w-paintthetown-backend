import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const BuildingSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
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
  centroidLng: {
    type: Number,
    required: true,
  },
  centroidLat: {
    type: Number,
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
  surfaceArea: {
    type: Number,
    required: true,
  },
  city: {
    type: mongoose.Schema.ObjectId,
    ref: 'City',
  },
  team: {
    type: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Team',
    }],
    default: [],
  },
  rgb: {
    type: [Number],
    default: [0, 0, 0],
  },
  hex: {
    type: String,
    default: '#000000',
  },
}, {
  timestamp: true,
});

// create model class
const BuildingModel = mongoose.model('Building', BuildingSchema);

export default BuildingModel;
