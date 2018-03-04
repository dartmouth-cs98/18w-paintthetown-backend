import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
  },
  typeOfLogin: {
    type: String,
    enum: ['email', 'facebook'],
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => (emailValidator.test(email)),
      message: '{VALUE} is not a valid email.',
    },
  },
  password: String,
  friends: {
    type: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }],
    default: [],
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team',
    default: null,
  },
}, {
  timestamp: true,
});

UserSchema.set('toJSON', {
  virtuals: true,
});

UserSchema.pre('save', function encryptPassword(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  return bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    // hash (encrypt) our password using the salt
    return bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }

      // overwrite plain text password with encrypted password
      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods
.comparePassword = function comparePassword(candidatePassword, callback) {
  return bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err); }

    return callback(null, isMatch);
  });
};

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
