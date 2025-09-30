/* eslint-env node */
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let database;
let connectPromise;

const FALLBACK_URI =
  'mongodb+srv://dev:dev123@cluster0.rhivlko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const FALLBACK_DB_NAME = 'dev';

function resolveMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();
  return uri && uri.length > 0 ? uri : FALLBACK_URI;
}

function resolveDatabaseName() {
  const name = process.env.MONGODB_DB_NAME?.trim();
  return name && name.length > 0 ? name : FALLBACK_DB_NAME;
}

async function initialiseDatabase() {
  const uri = resolveMongoUri();
  const dbName = resolveDatabaseName();

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
  if (database) {
    return database;
  }

  throw new Error('Database has not been initialised. Call connectToDatabase first.');
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    connectPromise = undefined;
  }
}
