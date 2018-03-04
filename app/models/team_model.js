import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const TeamSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  type: { // global, private, public
    type: String,
    required: true,
    enum: ['global', 'private', 'public'],
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
