const { MongoClient } = require("mongodb");
const config = require("./config");

const client = new MongoClient(config.MONGO_URI);

let db;

module.exports = async function mongoConnect() {
  try {
    await client.connect();
    db = client.db(config.MONGO_DB_NAME);
    console.log("MongoDB connected");
    return db;
  } catch (err) {
    console.log("MongoDB connection failed");
  }
};
