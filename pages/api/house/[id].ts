import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import House from '../../../models/House';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    const house = await House.findById(id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    res.status(200).json({ imageData: house.imageData });
  } catch (error) {
    console.error('Error fetching house image:', error);
    res.status(500).json({ 
      message: 'Failed to fetch house image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 