import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, message: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        prompt
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Error generating house'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 