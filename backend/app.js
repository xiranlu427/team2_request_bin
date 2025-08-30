//Import environment variables create variables
const env = require("./lib/config");
const HOST = env.HOST;
const PORT = env.PORT;

const express = require("express");

//Create an express server
const server = express();

server.get("/", (req, res) => {
  res.send("Hello world!");
});

server.listen(PORT, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
