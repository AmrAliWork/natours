const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
    maxlength: [20, `User's name must have less than or equal 20  characters.`],
    minlength: [3, `User's name must have more than or equal 3 characters.`]
  },
  email: {
    type: String,
    required: [true, 'Please enter your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email.']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password.'],
    minlength: [8, 'Password must have more than or equal 8 characters.'],
    maxlength: [16, 'Password  must have less than or equal 16 characters.'],
    select: false
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'Passwords are not the same. '
    }
  },

  passwordChangedAt: {
    type: Date
  },

  role: {
    type: String,
    default: 'user',
    enum: ['user', 'guide', 'lead-guide', 'admin']
  },
  PasswordRestToken: String,
  PasswordRestExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } });
});

userSchema.pre('save', function() {
  if (this.isModified('password') || this.isNew)
    this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre('save', async function() {
  // only run this function if password not modified
  // hash the password
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);

  // delete password Confirm from database
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function(
  candPassword,
  userPassword
) {
  return bcrypt.compare(candPassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
userSchema.methods.createPasswordRestToken = function() {
  const restToken = crypto.randomBytes(32).toString('hex');

  this.PasswordRestToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');

  this.PasswordRestExpires = Date.now() + 10 * 60 * 1000;
  return restToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
