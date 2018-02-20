import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const PatternSchema = new Schema({
  name: {
    type: String,
    required: true,
  }
}, {
  timestamp: true,
});

// create model class
const PatternModel = mongoose.model('Pattern', PatternSchema);

export default PatternModel;
