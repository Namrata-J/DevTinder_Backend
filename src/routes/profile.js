const express = require("express");
const profileRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const { profileEditDetailsValidator } = require("../utils/validation");

profileRouter.get("/view", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    return res.send({
      message: "Details fetched successfuly",
      data: user,
    });
  } catch (err) {
    console.error("ERROR while trying to fetch user's profile details" + err);
    res.status(500).json({ message: err.message });
  }
});

profileRouter.patch("/edit", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const loggedInUser = req.user;

    // validate data
    profileEditDetailsValidator(data);

    Object.keys(data).forEach((key) => (loggedInUser[key] = data[key]));
    const savedUser = await loggedInUser.save();

    res.send({
      message: "Profile updated successfuly",
      data: savedUser,
    });
  } catch (err) {
    console.error("ERROR while trying to edit user's profile details" + err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = profileRouter;
