const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../Schema/schema.js").AccountAdmin;

const checktokken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  const decoded = jwt.decode(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.decoded = decoded;

    next();
  });
};

const ReadToken = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const decoded = jwt.decode(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.json(decoded);
};

const CheckRole = (req, res, next) => {
  req.locals.user; // để truy cập thông tin người dùng nếu xác thực, nếu người dùng không hợp lệ giá trị sẽ là null
  next();
};

module.exports = { checktokken, ReadToken, CheckRole };
