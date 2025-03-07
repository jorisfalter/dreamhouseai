import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import dbConnect from '../../lib/mongodb';
import House from '../../models/House';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${response.headers.get('content-type')};base64,${base64}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

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
    
    // Fetch and convert image to Base64
    const imageData = await fetchImageAsBase64(imageUrl);

    // Save to MongoDB
    const house = await House.create({
      prompt,
      imageUrl,
      imageData,
    });

    // Return the stored Base64 image data instead of the temporary URL
    res.status(200).json({ imageUrl: house.imageData });
  } catch (error) {
    console.error('Error details:', error);
    let errorMessage = 'Error generating house';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
} 