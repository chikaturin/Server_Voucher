const Account = require("../Schema/schema.js").AccountAdmin;
const Service = require("../Schema/schema.js").Service;
const Partner = require("../Schema/schema.js").Partner;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Thêm thư viện bcryptjs để mã hóa mật khẩu
const crypto = require("crypto"); // Thêm thư viện crypto để tạo API Key ngẫu nhiên
dotenv.config();

const register = async (req, res) => {
  try {
    const { ServiceName, PassWord, Service } = req.body;
    const _id = ServiceName;
    const Api_key = crypto.randomBytes(16).toString("hex");

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(PassWord, 10);

    // Tạo API Key ngẫu nhiên
    const account = new Account({
      _id,
      ServiceName,
      PassWord: hashedPassword,
      Service,
      Api_key,
    });

    await account.save();

    res.status(201).json({ message: "Account created successfully", Api_key });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { ServiceName, PassWord } = req.body;
    const account = await Account.findOne({ ServiceName });

    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password with bcrypt
    const isMatch = await bcrypt.compare(PassWord, account.PassWord);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure account._id is defined before creating token
    if (!account._id) {
      return res.status(500).json({ message: "Account ID is missing" });
    }

    // Create access token
    const AccessTokken = jwt.sign(
      {
        account: account._id.toString(),
        ServiceName: account.ServiceName,
        Service: account.Service,
        apiKey: account.Api_key,
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      AccessTokken,
      message: "Access Token created successfully",
      Name: ServiceName,
      Pass: PassWord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//dịch tokken tài khoản
const getAccountByPartner = async (req, res) => {
  try {
    const Service_ID = req.decoded.account;
    const Service = await Account.findById(Service_ID);

    if (!Service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({
      _id: Service._id,
      ServiceName: Service.ServiceName,
      Service: Service.Service,
      apiKey: Service.Api_key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.find();
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getService = async (req, res) => {
  try {
    const service = await Service.find();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPartner = async (req, res) => {
  try {
    const partner = await Partner.find();
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { ServiceName } = req.body;
    const _id = `SVC${ServiceName}`;

    const service = new Service({
      _id,
      ServiceName,
    });

    await service.save();

    res.status(201).json({ message: "Service created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createPartner = async (req, res) => {
  try {
    const { Name, Service_ID } = req.body;
    const _id = `PTR${Name}`;
    const partner = new Partner({
      _id,
      Name,
      Service_ID,
    });
    await partner.save();
    res.status(201).json({ message: "Partner created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPartnerID = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  signIn,
  getAccount,
  getAccountByPartner,
  getService,
  getPartner,
  createService,
  createPartner,
  getPartnerID,
};
