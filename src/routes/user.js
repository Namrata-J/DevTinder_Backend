const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

userRouter.get("/connections", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const userConnections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser?._id }, { toUserId: loggedInUser?._id }],
      status: "accepted",
    })
      .populate("toUserId")
      .populate("fromUserId");

    const data = userConnections.map((connection) => {
      if (
        connection?.fromUserId?._id.toString() === loggedInUser?._id.toString()
      ) {
        return connection?.toUserId;
      } else {
        return connection?.fromUserId;
      }
    });

    res.send({ message: "Connections fetched successfuly", data });
  } catch (err) {
    console.error("ERROR while trying to fetch user connections" + err);
    res.status(500).send("ERROR: " + err);
  }
});

userRouter.get("/requests/received", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser?._id,
      status: "interested",
    }).populate("fromUserId");

    res.send({
      message: "Received connection requests fetched successfuly",
      data: connectionRequests,
    });
  } catch (err) {
    console.error(
      "ERROR while trying to fetch user's received connection requests" + err
    );
    res.status(500).send("ERROR: " + err);
  }
});

userRouter.get("/feed", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser?._id }, { toUserId: loggedInUser?._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((connection) => {
      hideUsersFromFeed.add(connection?.fromUserId.toString());
      hideUsersFromFeed.add(connection?.toUserId.toString());
    });

    const userFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser?._id } },
      ],
    })
      .skip(skip)
      .limit(limit);

    res.send({
      message: "Feed fetched successfuly",
      data: userFeed,
    });
  } catch (err) {
    console.error("ERROR while trying to fetch user's feed" + err);
    res.status(500).send("ERROR: " + err);
  }
});

module.exports = userRouter;
