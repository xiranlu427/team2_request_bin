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

server.get("/", (req, res) => {
  res.send("Hello world!");
});

//Error handler (Last Line of Defense)
server.use((error, req, res, _next) => {
  console.log(error);
  res.status(404).render("error", { error: error });
});

server.listen(PORT, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
