import mongoose, { Schema } from 'mongoose';

import Color from './color_model';

// create a schema for posts with a field
const TeamSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  color: {
    type: mongoose.Schema.ObjectId,
    ref: 'Color',
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const TeamModel = mongoose.model('Team', TeamSchema);

export default TeamModel;
