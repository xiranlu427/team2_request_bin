const { MongoClient, ObjectId } = require("mongodb");
const config = require("./config");

const client = new MongoClient(config.MONGO_URI);

module.exports = {
  mongoInsert: async function (body) {
    // Use connect method to connect to the server
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(config.MONGO_DB_NAME);
      const collection = db.collection("request_bodies");
      let result = await collection.insertOne({ body: body });
      await client.close();

      return result.insertedId;
    } catch (e) {
      console.error(e);
    }
  },

  mongoGetRequest: async function (docId) {
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(config.MONGO_DB_NAME);
      const collection = db.collection("request_bodies");

      let result = await collection.findOne({ _id: new ObjectId(docId) });
      await client.close();

      // console.log(result);
      return result.body;
    } catch (e) {
      console.error(e);
    }
  },
};
