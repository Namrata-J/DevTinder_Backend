const express = require("express");
const app = express();
const port = process.env.PORT;
const { connectDb } = require("./config/database");
const userRouter = require('./routes/user');
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require('./routes/connectionRequest');
var cookieParser = require("cookie-parser");
var cors = require('cors');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://13.201.6.106']
}));

// routers
app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/connectionRequest", connectionRequestRouter);

// connect to the db first and then listen on the port
connectDb()
  .then(() => {
    console.log("Database connection established...");
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Database cannot be connected!!!"));
