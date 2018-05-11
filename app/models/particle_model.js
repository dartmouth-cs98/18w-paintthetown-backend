import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const ParticleSchema = new Schema({
  pos: {
    type: [Number],
    default: null,
  },
  size: {
    type: Number,
    default: null,
  },
  rotation: {
    type: [Number],
    default: null,
  },
  color: {
    type: mongoose.Schema.ObjectId,
    ref: 'Color',
    default: null,
  },
  building: { // should be required
    type: mongoose.Schema.ObjectId,
    ref: 'Building',
    default: null,
  },
}, {
  timestamp: true,
});

// create model class
const ParticleModel = mongoose.model('Particle', ParticleSchema);

export default ParticleModel;
