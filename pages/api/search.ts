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
      return res.status(400).json({ message: 'Search term is required' });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection;

    // Perform the Atlas Search query
    const results = await db.collection('houses').aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: searchTerm,
            path: "prompt",  // Search in the prompt field
            fuzzy: {
              maxEdits: 1,
              prefixLength: 3
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          prompt: 1,
          imageUrl: 1,
          imageData: 1,
          createdAt: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $sort: { score: -1 }  // Sort by search relevance
      },
      {
        $limit: 12  // Limit results to 12 items
      }
    ]).toArray();

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Error performing search' });
  }
} 