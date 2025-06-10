const validator = require("validator");

const signupDataValidator = (res, data) => {
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
    !(profession?.length > 0 && expererienceLevel)
  ) {
    return res.status(400).send({ message: "Missing fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send({ message: "Invalid email" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).send({ message: "Invalid password" });
  }

  if (photoUrl && !validator.isURL(photoUrl)) {
    return res.status(400).send({ message: "Invalid photo url" });
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

module.exports = { signupDataValidator, profileEditDetailsValidator };
