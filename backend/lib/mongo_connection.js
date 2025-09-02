const { MongoClient, ObjectId } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017"; //PORT
const client = new MongoClient(url);
let db;
let collection;

module.exports = {
  mongoConnect: async function() {
    await client.connect();

    db = client.db("request_bin");
    collection = await db.collection("request_bodies");

    console.log("Connected to MongoDB");
  },

  mongoDisconnect: async function() {
    await client.close();
    console.log("Disconnected from MongoDB");
  },

  mongoInsert: async function (body) {
    try {
      let result = await collection.insertOne({ body: body });

      return result.insertedId;
    } catch (e) {
      console.error(e);
    }
  },

  mongoGetRequest: async function (documentId) {
    try {
      let result = await collection.findOne({
        _id: new ObjectId(`${documentId}`)
      });

      return result.body;
    } catch (e) {
      console.error(e);
    }
  },
};
