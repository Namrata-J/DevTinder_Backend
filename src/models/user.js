const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { validator } = require("validator");

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
      required: true,
    },
    company: {
      type: String,
    },
    expererienceLevel: {
      type: String,
      enum: ["0-3", "3-5", ">5"],
      default: "0-3",
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
          return validator.isURL(val);
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
    strict: "throw",
  }
);

const User = model('users', userSchema, 'users');

module.exports = { User };