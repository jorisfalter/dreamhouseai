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
    const results = await db.collection('your_collection_name').aggregate([
      {
        $search: {
          index: "default", // Make sure this matches your Atlas Search index name
          text: {
            query: searchTerm,
            path: {
              wildcard: "*" // This will search across all fields
            }
          }
        }
      },
      {
        $limit: 10 // Limit results to 10 items
      }
    ]).toArray();

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Error performing search' });
  }
} 