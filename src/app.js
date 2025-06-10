const express = require("express");
const app = express();
const port = 3000;
const { connectDb } = require("./config/database");

app.get("/", (req, res) => {
  res.send("Hello world!");
});

// connect to the db first and then listen on the port
connectDb()
  .then(() => {
    console.log("Database connection established...")
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Database cannot be connected!!!"));
