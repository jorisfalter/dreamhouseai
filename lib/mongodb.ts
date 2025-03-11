import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = global.mongoose as CachedConnection;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (cached?.conn) {
      console.log('Using cached connection');
      return cached.conn;
    }

    if (!cached?.promise) {
      const opts = {
        bufferCommands: false,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 50,
        ssl: true,
      };

      console.log('Creating new connection');
      cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      const mongoose = await cached!.promise;
      cached!.conn = mongoose;
      console.log('Connected to MongoDB');
      return mongoose;
    } catch (e) {
      cached!.promise = null;
      console.error('MongoDB connection error:', e);
      throw e;
    }
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw new Error('Could not connect to database');
  }
}

// Add this to help with development
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}

export default dbConnect; 