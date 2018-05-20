import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const ParticleSchema = new Schema({
  pos: {
    type: [Number],
    required: true,
  },
  rotation: {
    type: [Number],
    required: true,
  },
  color: {
    type: mongoose.Schema.ObjectId,
    ref: 'Color',
    required: true,
  },
  building: { // should be required
    type: String,
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const ParticleModel = mongoose.model('Particle', ParticleSchema);

export default ParticleModel;
