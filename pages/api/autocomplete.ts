import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { searchTerm } = req.body;
    
    if (!searchTerm) {
      return res.status(200).json({ suggestions: [] });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection;

    // Debug: Let's see what prompts we have
    const sampleDocs = await db.collection('houses').find({}).limit(3).toArray();
    console.log('Sample prompts:', sampleDocs.map(doc => doc.prompt));

    const results = await db.collection('houses').aggregate([
      {
        $search: {
          index: "default2", // Using the new index
          autocomplete: {
            query: searchTerm,
            path: "prompt"
          }
        }
      },
      {
        $project: {
          _id: 1,
          prompt: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();

    console.log('Search term:', searchTerm);
    console.log('Search results:', results);

    const suggestions = results.map(result => result.prompt);

    return res.status(200).json({ 
      suggestions,
      debug: {
        searchTerm,
        samplePrompts: sampleDocs.map(doc => doc.prompt),
        resultsFound: results.length
      }
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    if (error instanceof Error && error.message.includes('atlas')) {
      console.error('Atlas Search index error:', error);
      return res.status(500).json({ 
        message: 'Atlas Search index not ready. Please wait a few minutes and try again.',
        error: error.message
      });
    }
    return res.status(500).json({ 
      message: 'Error getting suggestions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}