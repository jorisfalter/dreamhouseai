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
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const houses = await House.find({}).sort({ createdAt: -1 });
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      data: houses
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch houses'
    });
  }
} 