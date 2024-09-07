const PrivateVoucher = require("../Schema/schema").PrivateVoucher;
const counterPrivateVoucher = require("../Schema/schema").counterPrivateVoucher;
const Partner = require("../Schema/schema").AccountPartNer;

const createPrivateVoucher = async (req, res) => {
  try {
    const {
      Name,
      PercentDiscount,
      StartDate,
      EndDate,
      Description,
      Image,
      Quantity,
      Conditions,
      Partner_ID,
    } = req.body;

    const Service_ID = req.decoded.account;
    // Lấy Service_ID từ token đã giải mã

    const counterVoucher = await counterPrivateVoucher.findOneAndUpdate(
      { _id: "PrivateVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const _id = `PV${counterVoucher.seq}`;

    const privateVoucher = new PrivateVoucher({
      _id,
      Name,
      PercentDiscount,
      StartDate,
      EndDate,
      Description,
      Image,
      Quantity,
      Conditions,
      Service_ID, // Service_ID lấy từ token
      Partner_ID,
    });

    await privateVoucher.save();
    res.status(201).json({ message: "Private Voucher created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePrivateVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      Name,
      PercentDiscount,
      StartDate,
      EndDate,
      Description,
      Image,
      Quantity,
      Conditions,
    } = req.body;

    const Service_ID = req.decoded.account;
    // Lấy Service_ID từ token đã giải mã

    const privateVoucher = await PrivateVoucher.findOneAndUpdate(
      { _id },
      {
        Name,
        PercentDiscount,
        StartDate,
        EndDate,
        Description,
        Image,
        Quantity,
        Conditions,
      },
      { new: true }
    );

    if (!privateVoucher) {
      return res.status(404).json({ message: "Private Voucher not found" });
    }

    res.json({ message: "Private Voucher updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePrivateVoucher = async (req, res) => {
  try {
    const { _id } = req.params;

    const Service_ID = req.decoded.account;
    // Lấy Service_ID từ token đã giải mã

    const privateVoucher = await PrivateVoucher.findOneAndDelete({
      _id,
    });

    if (!privateVoucher) {
      return res.status(404).json({ message: "Private Voucher not found" });
    }

    res.json({ message: "Private Voucher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrivateVoucher = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const Service = await Partner.findOne({ apiKey });
    const Partner_ID = req.params.Partner_ID;

    const privateVoucher = await PrivateVoucher.findOne(
      { _id: Service._id } && { Partner_ID }
    );

    res.json(privateVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrivateVoucherByPartner = async (req, res) => {
  try {
    const Service_ID = req.decoded.account;

    const privateVoucher = await PrivateVoucher.findOne({ Service_ID });
    res.json(privateVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrivateVoucherByAdmin = async (req, res) => {
  try {
    const privateVoucher = await PrivateVoucher.find();
    res.json(privateVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrivateVoucher,
  updatePrivateVoucher,
  deletePrivateVoucher,
  getPrivateVoucher,
  getPrivateVoucherByAdmin,
  getPrivateVoucherByPartner,
};
