/* eslint-env node */
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let database;

function assertEnvironmentVariables() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (!process.env.MONGODB_DB_NAME) {
    throw new Error('Missing MONGODB_DB_NAME environment variable');
  }
}

export async function connectToDatabase() {
  if (database) {
    return database;
  }

  assertEnvironmentVariables();

  client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  await client.connect();

  database = client.db(process.env.MONGODB_DB_NAME);
  await database.command({ ping: 1 });

  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error('Database has not been initialised. Call connectToDatabase first.');
  }

  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}
