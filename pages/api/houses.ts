import { connectDB } from '../../lib/mongodb';
import House from '../../models/House';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const houses = await House.find({})
      .select('prompt imageData createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log('Found houses:', houses.length); // Debug log
    res.status(200).json(houses);
  } catch (error) {
    console.error('Error in /api/houses:', error);
    res.status(500).json({ error: 'Failed to fetch houses' });
  }
} 