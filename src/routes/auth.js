const express = require("express");
const authRouter = express.Router();
const { signupDataValidator } = require("../utils/validation");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const data = req.body || {};

    // validate the data
    signupDataValidator(data);

    // check if user already exists
    const isExistingUser = await User.findOne({ email: data?.email });

    if (isExistingUser) {
      return res.status(409).send({ message: "User already exists" });
    }

    // encrypt password
    const saltRounds = 10;
    const hashPwd = await bcrypt.hash(data?.password, saltRounds);

    if (!hashPwd) {
      return res.status(500).send({ message: "Unknown error occurred" });
    }

    // create user and save in db
    const userDoc = new User({
      ...data,
      password: hashPwd,
    });
    const savedUser = await userDoc.save();

    // generate token and send it on cookies
    const token = await savedUser.getJwt();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send({ message: "User created successfuly", data: savedUser });
  } catch (err) {
    console.error("ERROR while trying to signup user" + err);
    res.status(500).send("ERROR: " + err);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new Error("Invalid credentials");
    }

    // check if password is valid
    const isValidPassword = await existingUser.validatePassword(password);

    if (isValidPassword) {
      // generate and send token in cookies
      const token = await existingUser.getJwt();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
    } else {
      throw new Error("Invalid credentials");
    }

    res.send({
      message: "LoggedIn successfuly",
      data: existingUser,
    });
  } catch (err) {
    console.error("ERROR while trying to login user" + err);
    res.status(500).send("ERROR: " + err);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send({ message: 'Logged out successfuly'});
  } catch (err) {
    console.error("ERROR while trying to logout user" + err);
    res.status(500).send("ERROR: " + err);
  }
});

module.exports = authRouter;