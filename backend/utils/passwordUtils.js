const argon2 = require("argon2");
const validator = require("validator");
const { pwnedPassword } = require("hibp");


const validatePassword = async (password) => {
  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    throw new Error(
      "Password must be at least 8 characters long with uppercase, lowercase, number, and symbol."
    );
  }

  const isBreached = await pwnedPassword(password);
  if (isBreached) {
    throw new Error("Password has been breached before. Please choose another.");
  }
};

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const verifyPassword = async (hash, password) => {
  return await argon2.verify(hash, password);
};

module.exports = { validatePassword, hashPassword, verifyPassword };
