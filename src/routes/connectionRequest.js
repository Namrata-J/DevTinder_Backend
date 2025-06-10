const express = require("express");
const connectionRequestRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const { User } = require("../models/user");
const { ConnectionRequest } = require("../models/connectionRequest");

// send/ignored/userid
// send/interested/userid
// review/rejected/requestid
// review/accepted/requestid

connectionRequestRouter.post(
  "/send/:status/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      // validate data
      const loggedInUser = req.user;
      const { status, userId } = req.params || {};

      const allowedStatus = ["ignored", "interested"];
      const isStatusValid = allowedStatus.includes(status);

      if (!isStatusValid) {
        return res.status(400).send({ message: "Invalid status value" });
      }

      const existingUser = await User.findById({ _id: userId });

      if (!existingUser) {
        return res.status(404).send({ message: "User not found" });
      }

      // check if same connection request already exists
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: loggedInUser?._id, toUserId: userId },
          { fromUserId: userId, toUserId: loggedInUser?._id },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId: loggedInUser?._id,
        toUserId: userId,
        status,
      });
      const savedConnectionRequest = await connectionRequest.save();

      res.send({
        message: "Connection request send successfuly",
        data: savedConnectionRequest,
      });
    } catch (err) {
      console.error("ERROR while trying to send connection request" + err);
      res.status(500).send("ERROR: " + err);
    }
  }
);

connectionRequestRouter.post(
  "/review/:status/:requestId",
  authMiddleware,
  async (req, res) => {
    try {
      // validate data
      const loggedInUser = req.user;
      const { status, requestId } = req.params || {};

      const allowedStatus = ["rejected", "accepted"];
      const isStatusValid = allowedStatus.includes(status);

      if (!isStatusValid) {
        return res.status(400).send({ message: "Invalid status value" });
      }

      const validConnectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        status: "interested",
        toUserId: loggedInUser?._id,
      });

      if (!validConnectionRequest) {
        return res
          .status(404)
          .send({ message: "Connection request not found" });
      }

      validConnectionRequest.status = status;

      const updatedConnectionRequest = await validConnectionRequest.save();

      req.send({
        message: "Connection request" + status,
        data: updatedConnectionRequest,
      });
    } catch (err) {
      console.error("ERROR while trying to review connection request" + err);
      res.status(500).send("ERROR: " + err);
    }
  }
);

module.exports = connectionRequestRouter;
