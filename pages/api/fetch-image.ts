import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'Image URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await fetchImageAsBase64(imageUrl);
    return new Response(
      JSON.stringify({ success: true, imageData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch image'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 