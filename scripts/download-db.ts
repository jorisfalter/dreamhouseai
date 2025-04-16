import { writeFileSync } from 'fs';
import { connect, Schema, model, Types } from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Define the House schema inline to avoid import issues
const HouseSchema = new Schema({
  prompt: String,
  imageUrl: String,
  imageData: String,
  createdAt: { type: Date, default: Date.now },
  tags: [String]  // Added tags to schema
});

const House = model('House', HouseSchema);

interface HouseDocument {
  _id: Types.ObjectId;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: Date;
  tags?: string[];  // Added tags to interface
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://joris:l0js9PDn4ZLVDAAw@cluster0.ytfyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function downloadDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connect(MONGODB_URI);
    console.log('Connected successfully');

    console.log('Fetching all houses...');
    const houses: HouseDocument[] = await House.find({})
      .select('prompt imageUrl imageData createdAt tags') // Added tags to selection
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${houses.length} houses`);

    // Convert ObjectIds to strings and format dates for JSON serialization
    const sanitizedHouses = houses.map(house => ({
      ...house,
      _id: house._id.toString(),
      createdAt: house.createdAt.toISOString(),
      tags: house.tags || [] // Ensure tags is always an array
    }));

    // Write to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db-backup-${timestamp}.json`;
    writeFileSync(filename, JSON.stringify(sanitizedHouses, null, 2));

    console.log(`Database backed up to ${filename}`);
    process.exit(0);
  } catch (error) {
    console.error('Error downloading database:', error);
    process.exit(1);
  }
}

downloadDB();