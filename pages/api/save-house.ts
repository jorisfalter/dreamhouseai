import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import House from '../../models/House';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { prompt, imageUrl, imageData } = req.body;
    
    if (!prompt || !imageUrl || !imageData) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    await dbConnect();

    const house = await House.create({
      prompt,
      imageUrl,
      imageData,
    });

    return res.status(200).json({ 
      success: true,
      imageUrl: house.imageData 
    });

  } catch (error) {
    console.error('Error saving house:', error);
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Error saving house'
    });
  }
} 