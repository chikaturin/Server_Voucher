const GeneralVoucher = require("../Schema/schema").GeneralVoucher;
const counterGenaralVoucher = require("../Schema/schema").counterGenaralVoucher;
const Partner = require("../Schema/schema").AccountPartNer;

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

    const Partner_ID = req.decoded.data._id; // Lấy Partner_ID từ token đã giải mã

    const counterVoucher = await counterGenaralVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const _id = `GV${counterVoucher.seq}`;

    const generalVoucher = new GeneralVoucher({
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
    });

    await generalVoucher.save();
    res.status(201).json({ message: "General Voucher created successfully" });
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

//get voucher by partner ở trên web service của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    const Partner_ID = req.decoded.data._id;
    const generalVoucher = await GeneralVoucher.findOne({ Partner_ID });
    res.json(generalVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by partner ở trên web service của họ nên cần API key
const getVoucherByPartner = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    const partner = await Partner.findOne({ apiKey });

    if (!partner) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    const generalVoucher = await GeneralVoucher.find({ _id: partner._id });
    res.json(generalVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGeneralVoucher,
  getGeneralVoucherByAdmin,
  getVoucherByPartner,
  getvoucherManagerbyPartner,
  updateGeneralVoucher,
  deleteGeneralVoucher,
};
