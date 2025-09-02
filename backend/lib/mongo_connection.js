const { MongoClient } = require("mongodb");
const config = require("./config");

const client = new MongoClient(config.MONGO_URI);

let db;

module.exports = {
  mongoInsert: async function (body) {
    // Use connect method to connect to the server
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(dbName);
      const collection = db.collection("request_bodies");
      let result = await collection.insertOne({ body: body });
      await client.close();

      return result;
    } catch (e) {
      console.error(e);
    }
  },

  mongoGetRequest: async function (docId) {
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(dbName);
      const collection = db.collection("request_bodies");

      let result = await collection.findOne({ objectId: docId });
      await client.close();

      return result;
    } catch (e) {
      console.error(e);
    }
  },
};
