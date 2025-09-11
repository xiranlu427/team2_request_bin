const HOST = '0.0.0.0'; 
const PORT = Number(process.env.PORT) || 3000;  

//Create an express server
const express = require("express");
const server = express();

// Create a 'ws' server for WebSockets
const http = require("http");
const WebSocket = require("ws"); // 'ws' is a Node.js library for WebSocket client (the backend) and server implementation
const httpServer = http.createServer(server); // This creates an 'http' server
const webSocketServer = new WebSocket.Server({ server: httpServer }); // This creates a WebSocket server and allows it to run on the same port as the http server

//Create API access variable
const PostgreSQL = require("./lib/pg_api");
const pgApi = new PostgreSQL();
const {
  mongoInsertBody,
  mongoGetBody,
  mongoDeleteBody,
} = require("./lib/mongo_connection");

//Import and use 'morgan' to log requests
const morgan = require("morgan");
server.use(morgan("dev"));

// Create validator
const {
  endpointIsTooLong,
  endpointContainsSymbols,
  endpointIsReserved,
} = require("./lib/validator");

//Add body parsing middlewear to make incoming bodies text, regardless of the type
server.use(express.text({ type: "*/*" }));

//Handles requests to clear the basket
server.put("/api/baskets/:endpoint", async (req, res, next) => {
  let endpoint = req.params.endpoint;

  try {
    if (!(await pgApi.basketExists(endpoint))) {
      return res.status(404).send("Endpoint does not exist.");
    }

    //Get the requests from PG, then clear the bodies from mongo
    let requests = await pgApi.getRequests(endpoint);
    for (let i = 0; i < requests.length; i++) {
      if (requests[i].body) {
        let deleted = await mongoDeleteBody(requests[i].body);

        if (!deleted) {
          const err = new Error("Mongo deletion issue");
          err.status = 500;
          throw err;
        }
      }
    }

    let basketCleared = await pgApi.clearBasket(endpoint);
    if (!basketCleared) {
      const err = new Error("Basket couldn't be cleared.");
      err.status = 500;
      throw err;
    }

    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
});

// Handles requests to delete a basket
server.delete("/api/baskets/:endpoint", async (req, res, next) => {
  let endpoint = req.params.endpoint;

  try {
    if (!(await pgApi.basketExists(endpoint))) {
      return res.status(404).send("Endpoint does not exist.");
    }

    //Clear the basket's request bodies from mongo first
    //Get the requests from PG, then clear the bodies from mongo
    let requests = await pgApi.getRequests(endpoint);
    for (let i = 0; i < requests.length; i++) {
      if (requests[i].body) {
        let deleted = await mongoDeleteBody(requests[i].body);

        if (!deleted) {
          const err = new Error("Mongo deletion issue");
          err.status = 500;
          throw err;
        }
      }
    }

    let basketDeleted = await pgApi.deleteBasket(endpoint);
    if (!basketDeleted) {
      const err = new Error("Basket couldn't be deleted.");
      err.status = 500;
      throw err;
    }

    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
});

// Handles requests to get all of the requests in a basket
server.get("/api/baskets/:endpoint", async (req, res, next) => {
  let endpoint = req.params.endpoint;

  try {
    if (!(await pgApi.basketExists(endpoint))) {
      return res.status(404).send("Endpoint does not exist.");
    }

    let requests = await pgApi.getRequests(endpoint);
    // Get each request's body from mongo and replace the body property on it with what mongo returns
    for (let i = 0; i < requests.length; i++) {
      if (requests[i].body) {
        let mongoDocId = requests[i].body;
        requests[i].body = await mongoGetBody(mongoDocId);
      }
    }

    return res.json(requests);
  } catch (e) {
    return next(e);
  }
});

// Handles requests to create a new basket
server.post("/api/baskets/:endpoint", async (req, res, next) => {
  let endpoint = req.params.endpoint;
  let errorMessage = "";

  try {
    if (await pgApi.basketExists(endpoint)) {
      // 409 CONFLICT
      errorMessage = "Could not create basket: endpoint already exists.";
      return res.status(409).send(errorMessage);
    }

    if (endpointIsTooLong(endpoint)) {
      // 414 URI TOO LONG
      errorMessage =
        "Could not create basket: endpoint length cannot exceed 100 characters.";
      return res.status(414).send(errorMessage);
    }

    if (endpointContainsSymbols(endpoint)) {
      // 400 BAD REQUEST
      errorMessage =
        "Could not create basket: endpoint can only contain alphanumeric characters.";
      return res.status(400).send(errorMessage);
    }

    if (endpointIsReserved(endpoint)) {
      // 403 FORBIDDEN - /web and /api are reserved
      errorMessage =
        "Could not create basket: endpoint conflicts with reserved system path.";
      return res.status(403).send(errorMessage);
    }

    let newBasket = await pgApi.createBasket(endpoint);
    if (!newBasket) {
      errorMessage = "Couldn't create basket.";
      throw new Error(errorMessage);
    }

    return res.sendStatus(201);
  } catch (e) {
    return next(e);
  }
});

// Handles requests to create a new url endpoint
server.get("/api/new_url_endpoint", async (_req, res) => {
  let errorMessage = "";
  try {
    let newURLEndpoint = await pgApi.getNewURLEndpoint();
    if (!newURLEndpoint) {
      errorMessage = "Couldn't generate new url endpoint.";
      throw new Error(errorMessage);
    }

    res.json(newURLEndpoint);
  } catch (e) {
    console.error(e);
    res.status(404).send(errorMessage);
  }
});

// Handles connection for WebSocket(s) on client(s)
webSocketServer.on("connection", (ws) => {
  console.log("WebSocket client connected!");

  ws.on("error", console.error);

  ws.on("close", () => {
    console.log("WebSocket client closed!");
  });
});

//Handles any type of request to the exposed endpoint, sends request data to request table (webhooks use this endpoint)
server.all("/api/:endpoint", async (req, res, next) => {
  let headers = JSON.stringify(req.headers);
  let method = req.method;
  let body = req.body; //Stored in Mongo
  let endpoint = req.params.endpoint;
  let errorMessage = "";

  try {
    if (!(await pgApi.basketExists(endpoint))) {
      return res.status(404).send("Endpoint does not exist.");
    }

    //Add the body to Mongo and get a document ID
    let documentId = await mongoInsertBody(body);

    // Try adding the request to the SQL database if it fails, send 404 error
    let requestAdded = await pgApi.addRequest(
      endpoint,
      headers,
      method,
      documentId
    );
    if (!requestAdded) {
      const err = new Error("Request couldn't be added.");
      err.status = 500;
      throw err;
    }

    // Sends a request directly to client using the WebSocket connection
    let request = { timestamp: new Date(), method, headers, body, endpoint };
    webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "new_request", data: request }));
      }
    });

    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
});

//Error handler (Last Line of Defense)
server.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
