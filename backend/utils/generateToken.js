const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
  const token = jwt.sign(
    {
      id: customerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );

  return token;
};

module.exports = generateToken;
