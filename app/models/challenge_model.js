import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const ChallengeSchema = new Schema({
  checkCompletion: {
    type: [Schema.Types.Mixed],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const Challenge = mongoose.model('Challenge', ChallengeSchema);

export default Challenge;
