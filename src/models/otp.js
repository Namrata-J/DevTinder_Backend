const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const bcrypt = require("bcrypt");

const otpSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
      default: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (val) {
          return validator.isEmail(val);
        },
        message: (props) => `${props?.value} is not a valid emailId.`,
      },
    },
    otp: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return validator.isStrongPassword(val);
        },
        message: (props) => `${props?.value} is not a strong password.`,
      },
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.validateOtp = async function (otp) {
  const userOtpDoc = this;
  const otpInputByUser = otp;

  const isValidOtp = bcrypt.compare(otpInputByUser, userOtpDoc?.otp);

  return isValidOtp;
};

const Otp = mongoose.model("otp", otpSchema, "otp");

Otp.init();

module.exports = { Otp };
