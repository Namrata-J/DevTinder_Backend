const userRouter = require("../routes/user");
const authRouter = require("../routes/auth");
const profileRouter = require("../routes/profile");
const connectionRequestRouter = require("../routes/connectionRequest");

const applyRoutes = (app) => {
  // routers
  app.use("/", authRouter);
  app.use("/user", userRouter);
  app.use("/profile", profileRouter);
  app.use("/connectionRequest", connectionRequestRouter);
};

module.exports = applyRoutes;