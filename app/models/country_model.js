import mongoose, { Schema } from 'mongoose';


// create a schema for posts with a field
const CountrySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  continent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Continent',
    required: true,
  },
  centroid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Coordinate',
    required: true,
  },
}, {
  timestamp: true,
});

// create model class
const CountryModel = mongoose.model('Country', CountrySchema);

export default CountryModel;
