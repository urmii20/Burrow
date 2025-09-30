/* eslint-env node */
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let client;
let database;
let connectPromise;
let memoryServer;

function resolveDbNameFromUri(uri) {
  try {
    const url = new URL(uri);
    const pathname = url.pathname.replace(/^\//, '');
    return pathname || 'test';
  } catch {
    return undefined;
  }
}

async function connectWithConfig({ uri, dbName }) {
  const mongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  await mongoClient.connect();
  await mongoClient.db('admin').command({ ping: 1 });

  client = mongoClient;
  database = client.db(dbName);

  return database;
}

async function initialiseDatabase() {
  const envUri = process.env.MONGODB_URI?.trim();
  const envDbName = process.env.MONGODB_DB_NAME?.trim();

  if (envUri) {
    try {
      return await connectWithConfig({
        uri: envUri,
        dbName: envDbName || resolveDbNameFromUri(envUri) || 'dev'
      });
    } catch (error) {
      console.error(
        '[mongo] Failed to connect using MONGODB_URI. Falling back to in-memory instance.',
        error
      );
    }
  }

  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }

  const uri = memoryServer.getUri();
  const dbName = resolveDbNameFromUri(uri) || 'dev';

  console.info('[mongo] Using in-memory MongoDB instance for development.');

  return connectWithConfig({ uri, dbName });
}

export async function connectToDatabase() {
  if (database) {
    return database;
  }

  if (!connectPromise) {
    connectPromise = initialiseDatabase().catch((error) => {
      connectPromise = undefined;
      throw error;
    });
  }

  return connectPromise;
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
    connectPromise = undefined;
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
