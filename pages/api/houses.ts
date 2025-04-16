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
    
    // Get page from query params, default to 0
    const page = Number(req.query.page) || 0;
    const limit = 12; // Reduced from 20 to 10 items per page
    
    // Only select specific fields (inclusion projection)
    const houses = await House.find({})
      .select('prompt imageUrl createdAt') // Only include these fields
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(page * limit)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const total = await House.countDocuments({});
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      data: houses,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
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