import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const TagSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
}, {
  timestamp: true,
},
);

// create model class
const TagModel = mongoose.model('Tag', TagSchema);

export default TagModel;
