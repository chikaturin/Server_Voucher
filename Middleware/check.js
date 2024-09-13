const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../Schema/schema.js").AccountService;

const checktokken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

const checkAPIkey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const service = await Account.findOne({ Api_key: apiKey });

  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }
  req.service = service;
  next();
};

module.exports = { checktokken, checkAPIkey };
