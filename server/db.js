// MongoDB connection. Call connect() once at startup before serving requests.
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'ctf';

let client = null;
let db = null;

export async function connect(uri = process.env.MONGODB_URI) {
  if (db) return db;
  if (!uri) throw new Error('MONGODB_URI is not set');
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  await createIndexes(db);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not connected — call connect() first');
  return db;
}

// The MongoClient (used by connect-mongo for the session store).
export function getClient() {
  return client;
}

async function createIndexes(database) {
  // Leaderboard ordering: highest score first, earliest submission breaks ties.
  await database.collection('results').createIndex({ totalScore: -1, submittedAt: 1 });
  // Case-insensitive team lookups by name (admin search).
  await database.collection('teams').createIndex({ name: 1 });
}
