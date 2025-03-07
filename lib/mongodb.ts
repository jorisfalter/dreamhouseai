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

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: Cached = global.mongoose as Cached;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      const conn = await cached.promise;
      cached.conn = conn;
      return conn;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  } catch (e) {
    throw e;
  }
}

export default dbConnect; 