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

connectionRequestSchema.statics.areConnected = async function ({
  userId1,
  userId2,
}) {
  const isAConnection = await this.findOne({
    $or: [
      { fromUserId: userId1, toUserId: userId2 },
      { fromUserId: userId2, toUserId: userId1 },
    ],
    status: "accepted",
  });

  if (isAConnection) {
    return true;
  }
  return false;
};

const ConnectionRequest = mongoose.model(
  "connectionRequests",
  connectionRequestSchema,
  "connection_requests"
);

ConnectionRequest.init();

module.exports = { ConnectionRequest };
