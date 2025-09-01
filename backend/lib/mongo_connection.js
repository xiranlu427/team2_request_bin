const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017"; //PORT
const client = new MongoClient(url);

// Database Name
const dbName = "request_bin";

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

  mongoGetRequest: async function () {
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(dbName);
      const collection = db.collection("request_bodies");

      let result = await collection.callback(...args);
      await client.close();

      return result;
    } catch (e) {
      console.error(e);
    }
  },
};
