import { MongoClient } from "mongodb";
import { env } from "process";

let client: MongoClient;

const getClient = () => {
  if (!env["MONGODB_URI"]) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  const uri = env["MONGODB_URI"];
  const options = { appName: "vivid" };
  if (env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = new MongoClient(uri, options);
    }
    client = globalWithMongo._mongoClient;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
  }
};

export const getDbConnection = async () => {
  return (await getDbClient()).db(undefined, { ignoreUndefined: true });
};

export const getDbConnectionSync = () => {
  if (!client) getClient();
  return client.db(undefined, { ignoreUndefined: true });
};

export const getDbClient = async () => {
  if (!client) getClient();

  return await client.connect();
};
