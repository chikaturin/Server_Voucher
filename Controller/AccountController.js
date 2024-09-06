const Account = require("../Schema/schema.js").AccountPartNer;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Thêm thư viện bcryptjs để mã hóa mật khẩu
const crypto = require("crypto"); // Thêm thư viện crypto để tạo API Key ngẫu nhiên

dotenv.config();

const register = async (req, res) => {
  try {
    const { PartnerName, PassWord, Service } = req.body;
    const _id = PartnerName;

    const existingAccount = await Account.findOne({ _id });
    if (existingAccount) {
      return res.status(400).json({ message: "ID already exists" });
    }

    const apiKey = crypto.randomBytes(16).toString("hex");

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(PassWord, 10);

    // Tạo API Key ngẫu nhiên
    const account = new Account({
      _id,
      PartnerName,
      PassWord: hashedPassword,
      Service,
      apiKey,
    });

    await account.save();

    res.status(201).json({ message: "Account created successfully", apiKey });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { PartnerName, PassWord } = req.body;
    const account = await Account.findOne({ PartnerName });

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Kiểm tra mật khẩu bằng bcrypt
    const isMatch = await bcrypt.compare(PassWord, account.PassWord);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Tạo access token
    const data = req.body;
    const AccessTokken = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET);

    res.json({ AccessTokken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAccountByPartner = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token is required" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const Partner_ID = decoded.data._id; // lay id khach hang tu token
    const Partner = await Account.findById({ _id: Partner_ID });

    if (!Partner) return res.status(404).json({ message: "Partner not found" });

    res.json({
      PartnerId: Partner._id,
      PartnerName: Partner.PartnerName,
      Service: Partner.Service,
      apiKey: Partner.apiKey,
    });
  });
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.find();
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, signIn, getAccount, getAccountByPartner };
