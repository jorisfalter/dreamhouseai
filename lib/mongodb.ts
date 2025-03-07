import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };
    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }
  try {
    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
  } catch (error) {
    global.mongoose.promise = null;
    throw error;
  }
} 