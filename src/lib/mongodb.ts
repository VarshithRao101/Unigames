import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  // Connection pool – keep small on free tier to avoid overwhelming Atlas M0
  maxPoolSize: 10,
  minPoolSize: 1,
  // Reasonable timeouts for serverless (Vercel functions can cold-start)
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

// In development we cache the client across hot-reloads so we don't
// exhaust the Atlas free-tier connection limit.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, a new module instance is created per serverless invocation
  // but the underlying TCP connection is reused via the pool.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
