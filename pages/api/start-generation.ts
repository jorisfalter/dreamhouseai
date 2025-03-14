import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Job from '../../models/Job';
import House from '../../models/House';
import OpenAI from 'openai';
import Replicate from "replicate";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

// Vercel's free tier has a 10s timeout
const TIMEOUT_DURATION = 8000; // 8 seconds to give us some buffer

function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, ms);
    })
  ]);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Always set JSON content type
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await timeoutPromise(dbConnect(), TIMEOUT_DURATION);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Create a new job with timeout
    const job = await timeoutPromise(
      Job.create({
        prompt,
        status: 'pending'
      }),
      TIMEOUT_DURATION
    );

    // Start the generation process in the background
    generateImage(job._id, prompt).catch(async (error) => {
      console.error('Background job failed:', error);
      try {
        const failedJob = await Job.findById(job._id);
        if (failedJob) {
          failedJob.status = 'failed';
          failedJob.error = error instanceof Error ? error.message : 'Unknown error';
          await failedJob.save();
        }
      } catch (e) {
        console.error('Failed to update job status:', e);
      }
    });

    return res.status(200).json({
      success: true,
      jobId: job._id,
      message: 'Generation started'
    });

  } catch (error) {
    console.error('Error starting generation:', error);
    
    if (error instanceof Error && error.message === 'Operation timed out') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable - please try again'
      });
    }

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

    // // Generate image with Dalle
    // const response = await openai.images.generate({
    //   model: "dall-e-3",
    //   prompt: `A photorealistic architectural visualization of ${prompt}. The image should be highly detailed, professional, and showcase the house in the best possible light.`,
    //   n: 1,
    //   size: "1024x1024",
    //   quality: "hd",
    //   style: "natural",
    // });
    // const imageUrl = response.data[0].url;


    // In the generateImage function:
    type ReplicateOutput = string | string[] | { [key: string]: any };

    const output = await replicate.run(
        "black-forest-labs/flux-1.1-pro",
        {
        input: {
            prompt: `A photorealistic architectural visualization of ${prompt}. The image should be highly detailed, professional, and showcase the house in the best possible light.`,
            width: 1024,
            height: 1024,
            num_inference_steps: 50,
            guidance_scale: 7.5,
        }
        }
    ) as ReplicateOutput;

    console.log("output", output);
    
    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    if (!imageUrl) {
      throw new Error('No image URL received from Replicate');
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

    // Save to House collection
    await House.create({
      prompt: prompt,
      imageUrl: imageUrl,
      imageData: imageData,
    });

  } catch (error) {
    console.error('Generation process failed:', error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    await job.save();
  }
} 