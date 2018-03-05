import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const AchievementSchema = new Schema({
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
    required: true,
  },
  type: {
      type: 'String',
      enum: ['coverage','possession','special-building','unlock','miscellaneous'],
  };

// create model class
const AchievementModel = mongoose.model('Achievement', AchievementSchema);

export default AchievementModel;
