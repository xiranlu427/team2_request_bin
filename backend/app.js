//Import environment variables
const env = require("./lib/config");
const HOST = env.HOST;
const PORT = env.PORT;

//Create an express server
const express = require("express");
const server = express();

//Import and use 'morgan'
const morgan = require("morgan");
server.use(morgan("dev"));

server.get("/", (req, res) => {
  res.send("Hello world!");
});

server.listen(PORT, () => {
  console.log(`Your server is now live on ${HOST}:${PORT}`);
});
