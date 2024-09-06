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
      Service_ID,
    } = req.body;

    const Partner_ID = req.decoded.data._id; // Lấy Partner_ID từ token đã giải mã

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
      Partner_ID, // Partner_ID lấy từ token
      Service_ID,
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

    const Partner_ID = req.decoded.data._id; // Lấy Partner_ID từ token đã giải mã

    const privateVoucher = await PrivateVoucher.findOneAndUpdate(
      { _id, Partner_ID },
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

    const Partner_ID = req.decoded.data._id; // Lấy Partner_ID từ token đã giải mã

    const privateVoucher = await PrivateVoucher.findOneAndDelete({
      _id,
      Partner_ID,
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
    const partner = await Partner.findOne({ apiKey });
    const Service_ID = req.params.Service_ID;

    const privateVoucher = await PrivateVoucher.findOne(
      { _id: partner._id } && { Service_ID }
    );

    res.json(privateVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPrivateVoucherByPartner = async (req, res) => {
  try {
    const Partner_ID = req.decoded.data._id;
    const privateVoucher = await PrivateVoucher.findOne({ Partner_ID });
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
