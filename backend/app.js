//Import environment variables
const env = require("./lib/config");
const HOST = env.HOST;
const PORT = env.PORT;
const data = {};

//Create an express server
const express = require("express");
const server = express();

//Create API access variable
const PostgreSQL = require("./lib/pg_api");
const pgApi = new PostgreSQL();

//Import and use 'morgan' to log requests
const morgan = require("morgan");
server.use(morgan("dev"));

//Add body parsing middlewear to make incoming bodies text, regardless of the type
server.use(express.text({ type: "*/*" }));

//Handles any type of request to the exposed endpoint, sends request data to request table
server.all("/:endpoint", async (req, res) => {
  let method = req.method;
  let headers = JSON.stringify(req.headers);
  let body = req.body; //Stored in Mongo
  let endpoint = req.params.endpoint;

  //Add the body to Mongo and get a document ID
  let documentId = body ? Math.random() * 1000 : undefined;

  // Try adding the request to the SQL database if it fails, send 404 error
  try {
    let requestAdded = await pgApi.addRequest(
      endpoint,
      method,
      headers,
      documentId
    );
    if (!requestAdded) throw new Error("Request couldn't be added.");

    res.status(200).send();
  } catch (e) {
    console.error(e);
    res.status(404).send();
  }
});

//Handles requests to clear the basket
server.put("/api/baskets/:endpoint", async (req, res) => {
  server.send("NOT IMPLEMENTED YET");
});

//Error handler (Last Line of Defense)
server.use((error, req, res, _next) => {
  console.log(error);
  res.status(404).render("error", { error: error });
});

server.listen(PORT, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
