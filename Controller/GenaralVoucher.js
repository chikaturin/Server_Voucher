const GeneralVoucher = require("../Schema/schema").GeneralVoucher;
const counterGenaralVoucher = require("../Schema/schema").counterGenaralVoucher;
const Account = require("../Schema/schema.js").AccountService;

const createGeneralVoucher = async (req, res) => {
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
    } = req.body;

    if (!Name || !PercentDiscount || !StartDate || !EndDate || !Quantity) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);
    if (endDate <= startDate) {
      return res
        .status(400)
        .json({ message: "EndDate must be after StartDate" });
    }

    const Service_ID = req.decoded.account;

    const counterVoucher = await counterGenaralVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create unique voucher ID
    const _id = `GV${counterVoucher.seq}`;

    const generalVoucher = new GeneralVoucher({
      _id,
      Name,
      PercentDiscount,
      StartDate: startDate,
      EndDate: endDate,
      Description,
      Image,
      Quantity,
      Conditions,
      Service_ID,
    });

    await generalVoucher.save();

    res.status(201).json({
      message: "General Voucher created successfully",
      voucher: generalVoucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGeneralVoucher = async (req, res) => {
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

    const generalVoucher = await GeneralVoucher.findById(_id);

    if (!generalVoucher) {
      return res.status(404).json({ message: "General Voucher not found" });
    }

    generalVoucher.Name = Name;
    generalVoucher.PercentDiscount = PercentDiscount;
    generalVoucher.StartDate = StartDate;
    generalVoucher.EndDate = EndDate;
    generalVoucher.Description = Description;
    generalVoucher.Image = Image;
    generalVoucher.Quantity = Quantity;
    generalVoucher.Conditions = Conditions;

    await generalVoucher.save();
    res.json({ message: "General Voucher updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGeneralVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const generalVoucher = await GeneralVoucher.findById(_id);

    if (!generalVoucher) {
      return res.status(404).json({ message: "General Voucher not found" });
    }

    await generalVoucher.remove();
    res.json({ message: "General Voucher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get voucher by admin voucher lấy tất cả voucher để xem bởi admin
const getGeneralVoucherByAdmin = async (req, res) => {
  try {
    const generalVoucher = await GeneralVoucher.find();
    res.json(generalVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by service ở trên web service của mình
const getvoucherManagerbyService = async (req, res) => {
  try {
    const Service_ID = req.decoded.account;
    const generalVoucher = await GeneralVoucher.find({
      Service_ID: Service_ID,
    });
    res.json(generalVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by service ở trên web service của họ nên cần API key
const getVoucherByService = async (req, res) => {
  try {
    const generalVoucher = await GeneralVoucher.find({
      Service_ID: req.service._id,
    });
    res.json(generalVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Choosevoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const generalVoucher = await GeneralVoucher.findById(_id);
    if (!generalVoucher) {
      return res.status(404).json({ message: "General Voucher not found" });
    }
    res.status(200).json(generalVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createGeneralVoucher,
  getGeneralVoucherByAdmin,
  getVoucherByService,
  getvoucherManagerbyService,
  updateGeneralVoucher,
  deleteGeneralVoucher,
  Choosevoucher,
};
