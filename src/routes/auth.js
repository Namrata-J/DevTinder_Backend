const express = require("express");
const authRouter = express.Router();
const { User } = require("../models/user");
const { Otp } = require("../models/otp");
const sendEmail = require("../services/resend");
const { generateHash, generateSecureOtp } = require("../utils/authUtils");
const {
  signupDataValidator,
  verifyDataValidator,
} = require("../utils/validation");

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
    const hashPwd = await generateHash(data?.password);

    if (!hashPwd) {
      return res.status(500).send({ message: "Unknown error occurred" });
    }

    // generate an otp
    const generatedOtp = generateSecureOtp();
    const hashOtp = await generateHash(generatedOtp);

    if (!hashOtp) {
      return res.status(500).send({ message: "Unable to generate otp" });
    }

    // create otp expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // save credentials + otphash + otpExpiry in otp collection
    await Otp.deleteMany({ email: data?.email });

    const otpDoc = new Otp({
      firstName: data?.firstName,
      email: data?.email,
      otp: hashOtp,
      password: hashPwd,
      expiresAt,
    });
    await otpDoc.save();

    // send email using ses
    const emailRes = await sendEmail.sendOtpEmail({
      to: data?.email,
      otp: generatedOtp,
    });
    if (!emailRes?.data?.id) {
      return res
        .status(500)
        .send({ message: "Error while trying to send an email" });
    }

    res.send({
      message: "Otp sent successfully",
      data: { email: data?.email },
    });
  } catch (err) {
    console.error("ERROR while trying to signup user" + err);
    res.status(500).json({ message: err.message });
  }
});

authRouter.post("/verify", async (req, res) => {
  try {
    const { otp, email } = req?.body || {};

    // validate data
    verifyDataValidator(req?.body);

    // check if there is a entry in otp collection
    const userOtpDocument = await Otp.findOne({ email });

    if (!userOtpDocument) {
      return res.status(400).send({ message: "Missing credentials" });
    }

    const isOtpCorrect = await userOtpDocument?.validateOtp(otp);

    if (!isOtpCorrect) {
      return res.status(422).send({ message: "Otp verification failed" });
    }

    // create user and save in db
    const userDoc = new User({
      firstName: userOtpDocument?.firstName,
      email,
      password: userOtpDocument?.password,
    });
    const savedUser = await userDoc.save();

    // delete entries for user with email from otp collection
    await Otp.deleteMany({ email });

    // generate token and send it on cookies
    const token = await savedUser.getJwt();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send({ message: "signup successful", data: savedUser });
  } catch (err) {
    console.error("ERROR while trying to verify otp" + err);
    res.status(500).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).send({ message: "User not found" });
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
    res.status(500).json({ message: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send({ message: "Logged out successfuly" });
  } catch (err) {
    console.error("ERROR while trying to logout user" + err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = authRouter;
