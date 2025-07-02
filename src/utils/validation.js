const validator = require("validator");

const verifyDataValidator = (data) => {
  const { otp, email } = data || {};

  if(otp && otp.length !== 6) {
    throw new Error({ message: "Invalid otp length" });
  }

  if (!validator.isEmail(email)) {
    throw new Error({ message: "Invalid email" });
  }
}

const signupDataValidator =(data) => {
  const {
    firstName,
    email,
    password,
    profession,
    expererienceLevel,
    photoUrl,
  } = data || {};

  if (
    !firstName ||
    !email ||
    !password ||
    (profession?.length > 0 && !expererienceLevel)
  ) {
    throw new Error({ message: "Missing fields" });
  }

  if (!validator.isEmail(email)) {
    throw new Error({ message: "Invalid email" });
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error({ message: "Invalid password" });
  }

  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error({ message: "Invalid photo url" });
  }
};

const profileEditDetailsValidator = (data) => {
  const restrictedFields = ["email", "password"];

  const isEditRestricted = Object.keys(data).some((field) =>
    restrictedFields.includes(field)
  );

  if (isEditRestricted) {
    throw new Error("Invalid edit request");
  }
};

module.exports = { verifyDataValidator, signupDataValidator, profileEditDetailsValidator };
