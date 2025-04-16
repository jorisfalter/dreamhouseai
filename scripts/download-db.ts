import { writeFileSync } from 'fs';
import { connect, Schema, model, Types } from 'mongoose';

// Define the House schema inline to avoid import issues
const HouseSchema = new Schema({
  prompt: String,
  imageUrl: String,
  imageData: String,
  createdAt: { type: Date, default: Date.now }
});

const House = model('House', HouseSchema);

interface HouseDocument {
  _id: Types.ObjectId;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: Date;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://joris:l0js9PDn4ZLVDAAw@cluster0.ytfyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function downloadDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connect(MONGODB_URI);
    console.log('Connected successfully');

    console.log('Fetching all houses...');
    const houses = await House.find({})
      .select('prompt imageUrl imageData createdAt')
      .sort({ createdAt: -1 })
      .lean<HouseDocument[]>();

    console.log(`Found ${houses.length} houses`);

    // Convert ObjectIds to strings for JSON serialization
    const sanitizedHouses = houses.map(house => ({
      ...house,
      _id: house._id.toString(),
      createdAt: house.createdAt.toISOString()
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