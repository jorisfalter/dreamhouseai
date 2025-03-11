import mongoose from 'mongoose';

export interface IJob {
  _id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  imageUrl?: string;
  imageData?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  prompt: String,
  imageUrl: String,
  imageData: String,
  error: String,
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model('Job', jobSchema); 