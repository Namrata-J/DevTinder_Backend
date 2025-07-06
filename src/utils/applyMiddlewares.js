var cors = require("cors");
const express = require("express");
var cookieParser = require("cookie-parser");

const applyMiddlewares = (app) => {
  // middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000", "http://13.201.6.106"],
    })
  );
};

module.exports = applyMiddlewares;