import mongoose from 'mongoose';

const HouseSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageData: {
    type: String,  // Base64 encoded image
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.House || mongoose.model('House', HouseSchema); 