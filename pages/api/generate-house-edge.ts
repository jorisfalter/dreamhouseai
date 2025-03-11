import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function fetchImageAsBase64(url: string): Promise<string> {
  console.log('Starting image fetch:', url);
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    console.log(`Fetch response received in ${Date.now() - startTime}ms`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log(`ArrayBuffer received in ${Date.now() - startTime}ms`);
    
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    const result = `data:${contentType};base64,${base64}`;
    
    console.log(`Image processing completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error(`Image fetch failed after ${Date.now() - startTime}ms:`, error);
    throw error;
  }
}

export default async function handler(req: NextRequest) {
  const startTime = Date.now();
  console.log('Starting request processing');

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Prompt is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling OpenAI API...');
    const openaiStartTime = Date.now();
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A photorealistic architectural visualization of ${prompt}. The image should be highly detailed, professional, and showcase the house in the best possible light.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
    
    console.log(`OpenAI response received in ${Date.now() - openaiStartTime}ms`);

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    console.log('Converting image to base64...');
    const imageData = await fetchImageAsBase64(imageUrl);

    const totalTime = Date.now() - startTime;
    console.log(`Total processing time: ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        imageData,
        prompt,
        timing: {
          total: totalTime,
          openai: Date.now() - openaiStartTime
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`Error after ${errorTime}ms:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Error generating house',
        errorDetails: process.env.NODE_ENV === 'development' ? {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timing: errorTime
        } : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 