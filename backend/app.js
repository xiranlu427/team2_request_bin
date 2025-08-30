//Import environment variables
const env = require("./lib/config");
const HOST = env.HOST;
const PORT = env.PORT;

//Create an express server
const express = require("express");
const server = express();

//Import and use 'morgan' to log requests
const morgan = require("morgan");
server.use(morgan("dev"));

//Import and use express validator to check the format of the params
const { body, validationResult } = require("express-validator");

//Add body parsing middlewear to make incoming bodies text, regardless of the type
server.use(express.text({ type: "*/*" }));

//Handles any type of request to the exposed endpoint, sends request data to request table
server.all("/:endpoint", async (req, res) => {
  let method = req.method;
  let headers = JSON.stringify(req.headers);
  let body = req.body;
  let endpoint = req.params.endpoint;

  console.log(endpoint);

  res.status(200).send();
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
