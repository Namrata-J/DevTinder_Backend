const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
      default: "User",
    },
    lastName: {
      type: String,
      maxLength: 50,
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
    location: {
      type: String,
    },
    profession: {
      type: String,
    },
    company: {
      type: String,
    },
    expererienceLevel: {
      type: String,
      enum: ["0-3", "3-5", ">5"],
      required: function () {
        return this.profession && this.profession.length > 0;
      },
      meta: { comment: "No of years of experience the user holds" },
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
    },
    lookingFor: {
      type: String,
      enum: [
        "Project Collaboration",
        "Mentorship",
        "Networking",
        "Job Opportunities",
      ],
    },
    photoUrl: {
      type: "String",
      default:
        "https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg",
      validate: {
        validator: function (val) {
          if (val) {
            return validator.isURL(val);
          } else {
            return true;
          }
        },
        message: (props) => `${props?.value} is not a valid url`,
      },
    },
    gender: {
      type: "String",
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender value`,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJwt = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user?._id }, "NJNode", {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const passwordInputByUser = password;

  const isValidPwd = await bcrypt.compare(
    passwordInputByUser,
    user?.password
  );

  return isValidPwd;
};

const User = mongoose.model("users", userSchema, "users");

User.init();

module.exports = { User };
