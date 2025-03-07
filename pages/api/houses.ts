import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import House from '../../models/House';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Only select the fields we need initially, excluding the large imageData
    const houses = await House.find({}, { imageData: 0 })
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json({ 
      success: true,
      data: houses 
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch houses',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 