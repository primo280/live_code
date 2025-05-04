const mongoose = require('mongoose');

const noteHistorySchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'restored'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NoteHistory', noteHistorySchema);