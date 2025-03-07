import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import House from '../../models/House';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // Only select the fields we need initially, excluding the large imageData
    const houses = await House.find({}, { imageData: 0 })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${houses.length} houses`);
    res.status(200).json(houses);
  } catch (error) {
    console.error('Error in /api/houses:', error);
    res.status(500).json({ 
      message: 'Failed to fetch houses',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 