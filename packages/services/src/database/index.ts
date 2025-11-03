import { Db, MongoClient } from "mongodb";

let client: MongoClient;

const getClient = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  const options = { appName: "vivid" };
  if (process.env.NODE_ENV === "development") {
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
  // If we are in a docker build, use a mock database so static page generation won't fail
  // NEXT_PUBLIC_IS_DOCKER_BUILD is set in the admin app Dockerfile
  // It has to be NEXT_PUBLIC_ because it will be accessed via static page generation which is like "client-side"
  if (process.env.NEXT_PUBLIC_IS_DOCKER_BUILD === "true") {
    return {} as Db;
  }

  if (!client) getClient();
  return client.db(undefined, { ignoreUndefined: true });
};

export const getDbClient = async () => {
  if (!client) getClient();

  return await client.connect();
};
