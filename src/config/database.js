const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://namratajain29001:WqJKA2CY5eknAAMn@njnode.ygkmvx4.mongodb.net/TechTribe"
  );
};

module.exports = { connectDb };
