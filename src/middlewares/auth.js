const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies || {};

    if (!token) {
      return res.status(401).send({message: "Invalid token"});
    }

    // decode the token
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    const { _id } = decodedToken;
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send({message: "User not found"});
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("ERROR while trying to authenticate user" + err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = authMiddleware;
