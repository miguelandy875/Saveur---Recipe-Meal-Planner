import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is required. Copy .env.example to .env and set your MongoDB URL.');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.name}`);
}
