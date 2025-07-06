const express = require("express");
const app = express();
const { connectDb } = require("./config/database");

// Load environment variables from .env file
const dotenv = require("dotenv");

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

// Import routes and middlewares
const applyRoutes = require("./utils/applyRoutes");
const applyMiddlewares = require("./utils/applyMiddlewares");

applyMiddlewares(app);
applyRoutes(app);

// Create an HTTP server
const http = require("http");
const { initSocket } = require("./services/socket");

const server = http.createServer(app);
initSocket(server);

// connect to the db first and then listen on the port
const port = process.env.PORT;
connectDb()
  .then(() => {
    console.log("Database connection established...");
    server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Database cannot be connected!!!"));
