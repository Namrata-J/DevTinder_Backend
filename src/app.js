const express = require("express");
const app = express();
const port = 3000;
const { connectDb } = require("./config/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
var cookieParser = require("cookie-parser");

// middlewares
app.use(express.json());
app.use(cookieParser());

// routers
app.use("/", authRouter);
app.use("/profile", profileRouter);

// connect to the db first and then listen on the port
connectDb()
  .then(() => {
    console.log("Database connection established...");
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Database cannot be connected!!!"));
