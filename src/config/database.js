const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(process.env.CONNECTION_URI);
};

module.exports = { connectDb };
