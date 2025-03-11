import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Job from '../../models/Job';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Create a new job
    const job = await Job.create({
      prompt,
      status: 'pending'
    });

    // Start the generation process in the background
    generateImage(job._id, prompt).catch(console.error);

    return res.status(200).json({
      success: true,
      jobId: job._id
    });
  } catch (error) {
    console.error('Error starting generation:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error starting generation'
    });
  }
}

async function generateImage(jobId: string, prompt: string) {
  const job = await Job.findById(jobId);
  if (!job) return;

  try {
    job.status = 'processing';
    await job.save();

    // Generate image
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

    // Fetch and convert image
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageData = `data:${contentType};base64,${base64}`;

    // Update job with results
    job.imageUrl = imageUrl;
    job.imageData = imageData;
    job.status = 'completed';
    await job.save();

  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    await job.save();
  }
} 