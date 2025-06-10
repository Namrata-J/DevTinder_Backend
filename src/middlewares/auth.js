const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookie || {};

    if (!token) {
      req.status(401).send("Invalid token");
    }

    // decode the token
    const decodedToken = await jwt.verify(token, "NJNode");

    const { _id } = decodedToken;
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("ERROR while trying to authenticate user" + err);
    res.status(500).send("ERROR: " + err);
  }
};

module.exports = authMiddleware;
