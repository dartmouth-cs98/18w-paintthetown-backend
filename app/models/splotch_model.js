import mongoose, { Schema } from 'mongoose';

// import Pattern from './pattern_model';
import User from './user_model';
import Team from './team_model';
import Coordinate from './coordinate_model';
import Building from './building_model';

// create a schema for posts with a field
const SplotchSchema = new Schema({
  centroid: { // coordinate on the building face
    type: mongoose.Schema.ObjectId,
    ref: 'Coordinate',
    required: true,
  },
  buildingFace: {
    type: String,
    required: true,
  },
  shape:{ //should be required
    type: String,
    required: false,
  },
  pattern:{
    type: mongoose.Schema.ObjectId,
    ref: 'Pattern',
    default: null,
  },
  building:{ //should be required
    type: mongoose.Schema.ObjectId,
    ref: 'Building',
    default: null,
  },
  team: { //should be required
    type: mongoose.Schema.ObjectId,
    ref: 'Team',
    default: null,
  },
  user: { //user that created the splotch. should be required
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamp: true,
});

// create model class
const SplotchModel = mongoose.model('Splotch', SplotchSchema);

export default SplotchModel;
