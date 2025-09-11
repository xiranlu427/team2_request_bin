const { Client } = require("pg");
const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const smClient = new SecretsManagerClient({ 
  region: "us-east-1",
});

const ssmClient = new SSMClient({ 
  region: "us-east-1", 
});

let cachedConnConfigPromise;

async function loadConnectionConfig() {
  try {
    const names = ['/rds/host', '/rds/port', '/rds/databasename'];
    const { Parameters = [] } = await ssmClient.send(new GetParametersCommand({ Names: names }));
    const map = Object.fromEntries(Parameters.map(p => [p.Name, p.Value]));

    // fetch Secrets (credentials)
    const secretId = 'request-bin/prod/rds-postgres';
    const secretRes = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
    const credentials = JSON.parse(secretRes.SecretString || '{}');

    // Build final connection object (fallbacks allow local .env if you keep it)
    return {
      host: map['/rds/host'],
      port: Number(map['/rds/port']),
      database: map['/rds/databasename'],
      user: credentials.username,
      password: credentials.password,
    };
  } catch (err) {
    throw new Error(`Failed to load PostgreSQL config from SSM/Secrets: ${err.message}`)
  }
}

function getConnConfig() {
  if (!cachedConnConfigPromise) cachedConnConfigPromise = loadConnectionConfig();
  return cachedConnConfigPromise;
}

function logQuery(statement, parameters) {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
}

module.exports = async function pgQuery(statement, ...parameters) {
  const CONNECTION = await getConnConfig();
  let client = new Client(CONNECTION);

  await client.connect();
  logQuery(statement, parameters);
  let result = await client.query(statement, parameters);
  await client.end();

  return result;
};
