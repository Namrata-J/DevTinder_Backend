const crypto = require("crypto");
const bcrypt = require("bcrypt");

const generateSecureOtp = () => {
  const min = 100000;
  const max = 999999;
  const otp = crypto.randomInt(min, max);
  return otp.toString();
};

const generateHash = (value) => {
  const saltRounds = 10;
  const hashValue = bcrypt.hash(value, saltRounds);
  return hashValue;
};

module.exports = { generateHash, generateSecureOtp };
