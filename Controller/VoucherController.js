const Voucher = require("../Schema/schema").VoucherGenaral;
const CounterVoucher = require("../Schema/schema").counterVoucher;
const CounterVoucherService = require("../Schema/schema").counterVoucherService;
const CounterVoucherPartner = require("../Schema/schema").counterVoucherPartner;
const Account = require("../Schema/schema.js").AccountAdmin;

const createVoucherbyAdmin = async (req, res) => {
  try {
    const {
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
    } = req.body;

    if (
      !VoucherName ||
      !ReleaseTime ||
      !RemainQuantity ||
      !MinValue ||
      !MaxValue ||
      !PercentDiscount
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime must be after ReleaseTime" });
    }

    const counterVoucher = await CounterVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create unique voucher ID
    const _id = `VC${counterVoucher.seq}`;
    const Status = "enable";

    const voucher = new Voucher({
      _id,
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
      Status,
    });

    await voucher.save();

    res.status(201).json({
      message: " Voucher created successfully",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//create voucher by service
const createVoucherbyService = async (req, res) => {
  try {
    const {
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
    } = req.body;

    if (
      !VoucherName ||
      !ReleaseTime ||
      !RemainQuantity ||
      !MinValue ||
      !MaxValue ||
      !PercentDiscount
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime must be after ReleaseTime" });
    }

    const counterVoucher = await CounterVoucherService.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create unique voucher ID
    const _id = `VCService${counterVoucher.seq}`;
    const Service_ID = req.decoded.account;
    const Status = "enable";

    const voucher = new Voucher({
      _id,
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
      Service_ID,
      Status,
    });

    await voucher.save();

    res.status(201).json({
      message: " Voucher created successfully",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//create voucher by partner
const createVoucherbyPartner = async (req, res) => {
  try {
    const {
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
    } = req.body;

    if (
      !VoucherName ||
      !ReleaseTime ||
      !RemainQuantity ||
      !MinValue ||
      !MaxValue ||
      !PercentDiscount
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime must be after ReleaseTime" });
    }

    const counterVoucher = await CounterVoucherPartner.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create unique voucher ID
    const _id = `VCPartner${counterVoucher.seq}`;

    const Service_ID = req.service._id;
    // Lấy Service_ID từ apiKey đã giải mã
    const Partner_ID = req.decoded.account;
    // Lấy Service_ID từ token đã giải mã

    const Status = "enable";

    const voucher = new Voucher({
      _id,
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
      Service_ID,
      Partner_ID,
      Status,
    });

    await voucher.save();

    res.status(201).json({
      message: " Voucher created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      VoucherName,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      MinValue,
      MaxValue,
      PercentDiscount,
    } = req.body;

    const voucher = await Voucher.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    voucher.VoucherName = VoucherName;
    voucher.ReleaseTime = ReleaseTime;
    voucher.ExpiredTime = ExpiredTime;
    voucher.Description = Description;
    voucher.Image = Image;
    voucher.RemainQuantity = RemainQuantity;
    voucher.MinValue = MinValue;
    voucher.MaxValue = MaxValue;
    voucher.PercentDiscount = PercentDiscount;

    voucher.Status = "disable";

    await voucher.save();

    voucher.Status = "enable";

    await voucher.save();

    res.json({
      message: "Voucher updated successfully and status is set to enable",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete voucher
const deleteVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const voucher = await Voucher.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: " Voucher not found" });
    }

    await voucher.remove();
    res.json({ message: " Voucher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get voucher by admin voucher lấy tất cả voucher để xem bởi admin
const getVoucherByAdmin = async (req, res) => {
  try {
    const voucher = await Voucher.find();
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by service ở trên web của mình
const getvoucherManagerbyService = async (req, res) => {
  try {
    const Service_ID = req.decoded.account;
    const voucher = await Voucher.find({
      Service_ID: Service_ID,
    });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by partner ở trên web của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    const Partner_ID = req.decoded.account;
    const voucher = await Voucher.find({
      Partner_ID: Partner_ID,
    });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by service ở trên web service của họ nên cần API key và partner ID
const getVoucherByService = async (req, res) => {
  const { Partner_ID } = req.body;
  try {
    const currentDate = new Date();

    const voucher = await Voucher.find({
      $or: [
        { ServiceID: "null" },
        { ServiceID: req.service._id },
        { Partner_ID: Partner_ID },
      ],
      ExpiredTime: { $gt: currentDate },
      RemainQuantity: { $gt: 0 },
    });

    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVoucherbyAdmin,
  createVoucherbyService,
  createVoucherbyPartner,
  updateVoucher,
  deleteVoucher,
  getVoucherByAdmin,
  getvoucherManagerbyService,
  getvoucherManagerbyPartner,
  getVoucherByService,
};
