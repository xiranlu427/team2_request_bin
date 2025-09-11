const { MongoClient, ObjectId } = require("mongodb");
const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const ssmClient = new SSMClient({ region: 'us-east-1' });
const smClient = new SecretsManagerClient({ region: 'us-east-1' });

let cachedConfigPromise;   
let clientPromise;        

async function loadMongoConfig() {
  try {
    const names = [
      '/documentdb/host',
      '/documentdb/port',
      '/documentdb/databasename',
      '/documentdb/options',
    ];
    const { Parameters = [] } = await ssmClient.send(new GetParametersCommand({ Names: names }));
    const map = Object.fromEntries(Parameters.map(p => [p.Name, p.Value]));

    const secretId = 'request-bin/prod/documentdb-mongodb';
    const secretRes = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
    const credentials = JSON.parse(secretRes.SecretString || '{}');

    const host = map['/documentdb/host'];
    const port = map['/documentdb/port'];
    const options = map['/documentdb/options'];
    const dbname = map['/documentdb/databasename']
    const username = credentials.username;
    const password = credentials.password;

    const uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/?${options}`;
    return { uri, dbname };
  } catch (err) {
    throw new Error(`Failed to load DocDB config from SSM/Secrets: ${err.message}`);
  }
}

async function getClient() {
  if (!clientPromise) {
    if (!cachedConfigPromise) cachedConfigPromise = loadMongoConfig();
    const { uri } = await cachedConfigPromise;
    const client = new MongoClient(uri);

    clientPromise = client.connect().then(c => {
      const cleanup = () => c.close().catch(() => {});
      process.once('SIGINT', cleanup);
      process.once('SIGTERM', cleanup);
      return c;
    });
  }
  return clientPromise;
}

async function withCollection(fn) {
  const client = await getClient();
  const { dbname } = await cachedConfigPromise;
  const col = client.db(dbname).collection('request_bodies');
  return fn(col);
}

module.exports = {
  mongoInsertBody: async (body) => {
    const res = await withCollection(col => col.insertOne({ body }));
    return res.insertedId.toString();
  },
  mongoGetBody: async (docId) => {
    const doc = await withCollection(col => col.findOne({ _id: new ObjectId(docId) }));
    return doc ? doc.body : null;
  },
  mongoDeleteBody: async (docId) => {
    const res = await withCollection(col => col.deleteOne({ _id: new ObjectId(docId) }));
    return res.deletedCount;
  },
};
