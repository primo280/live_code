// models/User.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Empêche la création de doublons avec des espaces différents
userSchema.pre('save', function(next) {
  this.username = this.username.trim().toLowerCase()
  next()
})

module.exports = mongoose.model('User', userSchema)