const validator = require("validator");

const validateSignup = (req) => {
  const { name, email } = req;
  if (!name) {
    throw new Error("provide name");
  }
  if (!validator.isEmail(email)) {
    throw new Error("provide email");
  }
};
module.exports = {
  validateSignup,
};
