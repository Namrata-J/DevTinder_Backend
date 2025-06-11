const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
  fromUserId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "users",
  },
  toUserId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "users",
  },
  status: {
    type: String,
    enum: ["ignored", "interested", "rejected", "accepted"],
  },
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest?.toUserId)) {
    throw new Error("Cannot send request to yourself");
  }
  next();
});

const ConnectionRequest = mongoose.model(
  "connectionRequests",
  connectionRequestSchema,
  "connection_requests"
);

ConnectionRequest.init();

module.exports = { ConnectionRequest };
