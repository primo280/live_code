import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    tags: [String],
    author: { type: String, required: true }, // ← ceci est nécessaire
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);