import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import dbConnect from '../../lib/mongodb';
import House from '../../models/House';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

async function fetchImageAsBase64(url: string, timeout = 30000): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'image/*'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Start MongoDB connection early
  const dbPromise = dbConnect();

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Generate image using OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A photorealistic architectural visualization of ${prompt}. The image should be highly detailed, professional, and showcase the house in the best possible light.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }
    
    // Fetch image in parallel with DB connection
    const [imageData, db] = await Promise.all([
      fetchImageAsBase64(imageUrl),
      dbPromise
    ]);

    // Save to MongoDB
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
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          message: 'Request timeout - please try again',
        });
      }
      
      if (error.message.includes('MongoDB') || error.message.includes('mongoose')) {
        return res.status(503).json({
          success: false,
          message: 'Database connection error - please try again',
        });
      }
    }

    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Error generating house',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 