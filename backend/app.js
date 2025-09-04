//Import environment variables
const config = require("./lib/config");
const HOST = config.HOST;
const PORT = config.PORT;

const path = require("path");

//Create an express server
const express = require("express");
const server = express();

//Create API access variable
const PostgreSQL = require("./lib/pg_api");
const pgApi = new PostgreSQL();
const { mongoInsert, mongoGetRequest } = require("./lib/mongo_connection");

//Import and use 'morgan' to log requests
const morgan = require("morgan");
server.use(morgan("dev"));

// Create validator
const { endpointIsTooLong, endpointContainsSymbols, endpointOverlapsWeb } = require("./lib/validator");

//Add body parsing middlewear to make incoming bodies text, regardless of the type
server.use(express.text({ type: "*/*" }));

// Add static middlewear to return files with static content
server.use("/web", express.static('dist')); // changed the base url where static content is served
server.get(/^\/web(?:\/.*)?$/, (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
server.get("/", (_req, res) => res.redirect("/web"));

//Handles requests to clear the basket
server.put("/api/baskets/:endpoint", async (req, res) => {
  let endpoint = req.params.endpoint;
  let errorMessage = '';

  try {
    if (!await pgApi.basketExists(endpoint)) {
      errorMessage = "Endpoint does not exist."
      throw new Error(errorMessage);
    }

    let basketCleared = await pgApi.clearBasket(endpoint);
    if (!basketCleared) {
      let errorMessage = "Basket couldn't be cleared.";
      throw new Error(errorMessage);
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

// Handles requests to delete a basket
server.delete("/api/baskets/:endpoint", async (req, res) => {
  let endpoint = req.params.endpoint;
  let errorMessage = '';

  try {
    if (!await pgApi.basketExists(endpoint)) {
      errorMessage = "Endpoint does not exist."
      throw new Error(errorMessage);
    }

    let basketDeleted = await pgApi.deleteBasket(endpoint);
    if (!basketDeleted) {
      errorMessage = "Basket couldn't be deleted.";
      throw new Error(errorMessage);
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

// Handles requests to get all of the requests in a basket
server.get("/api/baskets/:endpoint", async (req, res) => {
  //Don't allow non-local requests to this endpoint
  // if (!req.headers.host.includes("localhost")) {
  //   res.status(403).send("API access denied");
  // }

  let endpoint = req.params.endpoint;
  let errorMessage = '';

  try {
    if (!await pgApi.basketExists(endpoint)) {
      errorMessage = "Endpoint does not exist."
      throw new Error(errorMessage);
    }
    
    let requests = await pgApi.getRequests(endpoint);
    if (!requests) {
      errorMessage = "Requests couldn't be fetched.";
      throw new Error(errorMessage);
    }

    for (let i = 0; i < requests.length; i++) {
      if (requests[i].id) {
        let mongoDocId = requests[i].body;
        requests[i].body = await mongoGetRequest(
          mongoDocId.replaceAll('"', "")
        );
      }
    }

    res
      .setHeader("Content-Type", "application/json")
      .send(JSON.stringify(requests));
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

// Handles requests to create a new basket
server.post("/api/baskets/:endpoint", async (req, res) => {
  //Don't allow non-local requests to this endpoint
  // if (!req.headers.host.includes("localhost")) {
  //   res.status(403).send("API access denied");
  // }

  let endpoint = req.params.endpoint;
  let errorMessage = '';

  try {
    if (await pgApi.basketExists(endpoint)) {
      // 403 CONFLICT
      res.status(403).send("Could not create basket: endpoint already exists.");
    }

    if (endpointIsTooLong(endpoint)) {
      // 414 URI TOO LONG
      res.status(414).send("Could not create basket: endpoint length cannot exceed 100 characters.");
    }

    if (endpointContainsSymbols(endpoint)) {
      // 400 BAD REQUEST
      res.status(400).send("Could not create basket: endpoint can only contain alphanumeric characters.");
    }
    
    if (endpointOverlapsWeb(endpoint)) {
      // 403 CONFLICT
      res.status(403).send("Could not create basket: endpoint conflicts with reserved system path.");
    }

    let newBasket = await pgApi.createBasket(endpoint);
    if (!newBasket) {
      errorMessage = "Couldn't create basket.";
      throw new Error(errorMessage);
    }

    res.status(201).send();
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

// Handles requests to create a new url endpoint
server.get("/api/new_url_endpoint", async (req, res) => {
  //Don't allow non-local requests to this endpoint
  // if (!req.headers.host.includes("localhost")) {
  //   res.status(403).send("API access denied");
  // }

  let errorMessage = '';
  try {
    let newURLEndpoint = await pgApi.getNewURLEndpoint();
    if (!newURLEndpoint) {
      errorMessage = "Couldn't generate new url endpoint."
      throw new Error(errorMessage);
    }

    res.json(newURLEndpoint);
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

//Handles any type of request to the exposed endpoint, sends request data to request table (webhooks use this endpoint)
server.all("/:endpoint", async (req, res) => {
  let headers = JSON.stringify(req.headers);
  let method = req.method;
  let body = req.body; //Stored in Mongo
  let endpoint = req.params.endpoint;
  let errorMessage = '';

  try {
    if (!await pgApi.basketExists(endpoint)) {
      errorMessage = "Endpoint does not exist."
      throw new Error(errorMessage);
    }
    
    //Add the body to Mongo and get a document ID
    let documentId = await mongoInsert(body);

    // Try adding the request to the SQL database if it fails, send 404 error
    let requestAdded = await pgApi.addRequest(
      endpoint,
      headers,
      method,
      documentId
    );
    if (!requestAdded) {
      errorMessage = "Request couldn't be added."
      throw new Error(errorMessage);
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

//Error handler (Last Line of Defense)
server.use((error, req, res, _next) => {
  console.log(error);
  res.status(404).render("error", { error: error });
});

// Handler requests for all other/unknown endpoints
server.use((req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
