import mongoose from 'mongoose';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in .env.local');
}

// Define the House schema with tags
const HouseSchema = new mongoose.Schema({
  prompt: String,
  imageUrl: String,
  imageData: String,
  createdAt: { type: Date, default: Date.now },
  tags: [String]  // Array of string tags
});

const House = mongoose.models.House || mongoose.model('House', HouseSchema);

interface HouseDocument {
  _id: mongoose.Types.ObjectId;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: Date;
  tags?: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function generateTags(prompt: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a helpful assistant that generates tags for house descriptions. Return only a comma-separated list of relevant tags, no other text."
      }, {
        role: "user",
        content: `Generate relevant architectural and style tags for this house description: "${prompt}"`
      }],
      temperature: 0.7,
      max_tokens: 100
    });

    const tags = response.choices[0].message.content?.split(',')
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => tag.length > 0) || [];
    
    console.log(`Generated tags for prompt "${prompt}": ${tags.join(', ')}`);
    return tags;
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

async function updateHouseTags() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected successfully');

    // Find all houses without tags
    const houses: HouseDocument[] = await House.find({ 
      $or: [
        { tags: { $exists: false } },
        { tags: { $size: 0 } }
      ]
    }).lean();

    console.log(`Found ${houses.length} houses without tags`);

    for (const house of houses) {
      console.log(`Processing house ${house._id}...`);
      const tags = await generateTags(house.prompt);
      
      if (tags.length > 0) {
        await House.findByIdAndUpdate(house._id, {
          $set: { tags: tags }
        });
        console.log(`Updated house ${house._id} with tags: ${tags.join(', ')}`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished updating tags');
    process.exit(0);
  } catch (error) {
    console.error('Error updating tags:', error);
    process.exit(1);
  }
}

updateHouseTags(); 