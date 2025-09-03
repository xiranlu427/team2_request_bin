const { MongoClient, ObjectId } = require("mongodb");
const config = require("./config");

const client = new MongoClient(config.MONGO_URI);

module.exports = {
  mongoInsertBody: async function (body) {
    // Inserts the specified body as a document, then returns the document Id
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(config.MONGO_DB_NAME);
      const collection = db.collection("request_bodies");
      let result = await collection.insertOne({ body: body });
      await client.close();

      return result.insertedId.toString();
    } catch (e) {
      console.error(e);
    }
  },

  mongoGetBody: async function (docId) {
    //Returns the body of the specified document
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

  mongoDeleteBody: async function (docId) {
    //Deletes the request with the specified document Id, returns the deletion count
    try {
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(config.MONGO_DB_NAME);
      const collection = db.collection("request_bodies");

      let result = await collection.deleteOne({ _id: new ObjectId(docId) });
      await client.close();

      return result.deletedCount;
    } catch (e) {
      console.error(e);
    }
  },
};
