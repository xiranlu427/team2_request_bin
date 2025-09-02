const { ObjectId } = require("mongodb");
const mongoConnect = require("./mongo_connection");
const config = require("./config");
const collectionName = config.MONGO_COLLECTION_NAME;

module.exports = class MongoDB {
  insert = async function (body) {
    const db = await mongoConnect();
    const result = await db.collection(collectionName).insertOne({
      body: body
    });
    return result.insertedId;
  }
  
  get = async function (id) {
    const db = await mongoConnect();
    const result = await db.collection(collectionName).findOne({
      _id: new ObjectId(id)
    });
    return result.body;
  }

  delete = async function (id) {
    const db = await mongoConnect();
    await db.collection(collectionName).deleteOne({
      _id: new ObjectId(id)
    });
  }
}
