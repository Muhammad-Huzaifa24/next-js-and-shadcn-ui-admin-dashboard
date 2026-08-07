import mongoose from 'mongoose';

/**
 * Mongoose cached connection singleton.
 *
 * In a serverless environment (Vercel) each function invocation may reuse
 * an existing Node.js module, so we cache the connection on the module-level
 * `cached` variable to avoid opening a new connection on every request.
 *
 * Pattern: https://mongoosejs.com/docs/lambda.html
 */

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection immediately
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse an in-progress connection promise (handles concurrent cold starts)
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI environment variable is not set');

    console.log('🔌 Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // matches BackEnd/src/config/db.js
      connectTimeoutMS: 15000,
    }).then((mongoose) => {
      const dbName = mongoose.connection.db?.databaseName || 'unknown';
      console.log(`🗄️  MongoDB connected to database: ${dbName}`);
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
