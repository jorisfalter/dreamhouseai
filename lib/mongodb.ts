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

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (cached?.conn) {
      return cached.conn;
    }

    if (!cached?.promise) {
      const opts = {
        bufferCommands: false,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        maxPoolSize: 50,
        ssl: true,
      };

      console.log('Connecting to MongoDB...');
      cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      const conn = await cached!.promise;
      console.log('Connected to MongoDB');
      cached!.conn = conn;
      return conn;
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