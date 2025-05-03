import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);