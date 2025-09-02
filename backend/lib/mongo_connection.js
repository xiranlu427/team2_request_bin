const { MongoClient, ObjectId } = require("mongodb");

module.exports = {
  url: "mongodb://localhost:27017",
  client: new MongoClient(this.url),
  db: client.db("request_bin"),
  collection : db.collection("request_bodies"),
  // mongoConnect: async function() {
  //   await client.connect();

  //   db = client.db("request_bin");
  //   collection = await db.collection("request_bodies");

  //   console.log("Connected to MongoDB");
  // },

  // mongoDisconnect: async function() {
  //   await client.close();
  //   console.log("Disconnected from MongoDB");
  // },

  mongoInsert: async function (body) {
    try {
      let result = await this.collection.insertOne({ body: body });
      
      return result.insertedId;
    } catch (e) {
      console.error(e);
    }
  },

  mongoGetRequest: async function (documentId) {
    try {
      let result = await this.collection.findOne({
        _id: new ObjectId(`${documentId}`)
      });

      return result.body;
    } catch (e) {
      console.error(e);
    }
  },
};
