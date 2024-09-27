const VoucherDB = require("../Schema/schema").Voucher;
const CounterVoucher = require("../Schema/schema").counterVoucher;
const ConditionDB = require("../Schema/schema").Condition;
const CounterCondition = require("../Schema/schema").counterCondition;
const HaveVoucherDB = require("../Schema/schema").HaveVoucher;
const CounterHaveVoucher = require("../Schema/schema").counterHaveVoucher;

const createVoucherbyAdmin = async (req, res) => {
  try {
    const {
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
      HaveVouchers,
    } = req.body;

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime phải sau ReleaseTime" });
    }
    if (ReleaseTime < new Date.now()) {
      return res
        .status(400)
        .json({ message: "ReleaseTime phải sau thời gian hiện tại" });
    }

    const counterVoucher = await CounterVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const idVoucher = `VC${counterVoucher.seq}`;
    const States = "enable";

    let min = Conditions[0].MinValue;
    for (const condition of Conditions) {
      const { MinValue, MaxValue, PercentDiscount } = condition;

      const counterCondition = await CounterCondition.findOneAndUpdate(
        { _id: "GenaralCondition" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idCondition = `CD${counterCondition.seq}`;

      if (PercentDiscount < 0 || PercentDiscount > 100) {
        return res
          .status(400)
          .json({ message: "PercentDiscount phải từ 0 đến 100" });
      }
      if (MinValue < 0 || MaxValue < 0) {
        return res
          .status(400)
          .json({ message: "MinValue và MaxValue phải lớn hơn 0" });
      }

      if (min > MinValue) {
        min = MinValue;
      }
      const newCondition = new ConditionDB({
        _id: idCondition,
        Voucher_ID: idVoucher,
        MinValue,
        MaxValue,
        PercentDiscount,
      });
      await newCondition.save();
    }

    const voucher = new VoucherDB({
      _id: idVoucher,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
      MinCondition: min,
    });
    await voucher.save();

    for (const haveVoucher of HaveVouchers) {
      const { Service_ID } = haveVoucher;
      const counterHaveVoucher = await CounterHaveVoucher.findOneAndUpdate(
        { _id: "GenaralHaveVoucher" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idHaveVoucher = `HV${counterHaveVoucher.seq}`;
      const newHaveVoucher = new HaveVoucherDB({
        _id: idHaveVoucher,
        Voucher_ID: idVoucher,
        Service_ID,
      });
      await newHaveVoucher.save();
    }

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//-------------------------------------------------create voucher by partner
const createVoucherbyPartner = async (req, res) => {
  try {
    const {
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
      HaveVouchers,
    } = req.body;

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime phải sau ReleaseTime" });
    }
    if (ReleaseTime < new Date()) {
      return res
        .status(400)
        .json({ message: "ReleaseTime phải sau thời gian hiện tại" });
    }

    const counterVoucher = await CounterVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const idVoucher = `VC${counterVoucher.seq}`;
    const States = "enable";
    const partner_ID = req.decoded?._id;
    if (!partner_ID) {
      return res.status(400).json({ message: "Không tìm thấy partner_ID" });
    }

    let min = Conditions[0].MinValue;

    for (const condition of Conditions) {
      const { MinValue, MaxValue, PercentDiscount } = condition;

      const counterCondition = await CounterCondition.findOneAndUpdate(
        { _id: "GenaralCondition" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idCondition = `CD${counterCondition.seq}`;

      if (PercentDiscount < 0 || PercentDiscount > 100) {
        return res
          .status(400)
          .json({ message: "PercentDiscount phải từ 0 đến 100" });
      }
      if (MinValue < 0 || MaxValue < 0) {
        return res
          .status(400)
          .json({ message: "MinValue và MaxValue phải lớn hơn 0" });
      }

      if (min > MinValue) {
        min = MinValue;
      }

      const newCondition = new ConditionDB({
        _id: idCondition,
        Voucher_ID: idVoucher,
        MinValue,
        MaxValue,
        PercentDiscount,
      });
      await newCondition.save();
    }

    const voucher = new VoucherDB({
      _id: idVoucher,
      Name,
      Partner_ID: partner_ID,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
      MinCondition: min,
    });
    await voucher.save();

    for (const haveVoucher of HaveVouchers) {
      const { Service_ID } = haveVoucher;
      const counterHaveVoucher = await CounterHaveVoucher.findOneAndUpdate(
        { _id: "GenaralHaveVoucher" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idHaveVoucher = `HV${counterHaveVoucher.seq}`;
      const newHaveVoucher = new HaveVoucherDB({
        _id: idHaveVoucher,
        Voucher_ID: idVoucher,
        Service_ID,
      });
      await newHaveVoucher.save();
    }

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//-------------------------------------------------------------detailvoucher
const DetailVoucher = async (req, res) => {
  try {
    const { _id } = req.params;

    const vouchersWithDetails = await VoucherDB.aggregate([
      {
        $match: { _id },
      },
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);
    res.json(vouchersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//---------------------------------------------------------------Update
const updateVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const { ReleaseTime, ExpiredTime, Description, Image, RemainQuantity } =
      req.body;

    const voucher = await VoucherDB.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (ReleaseTime >= ExpiredTime) {
      return res
        .status(400)
        .json({ message: "ExpiredTime must be after ReleaseTime" });
    }
    if (ReleaseTime < new Date()) {
      return res
        .status(400)
        .json({ message: "ReleaseTime must be after current time" });
    }

    voucher.ReleaseTime = ReleaseTime;
    voucher.ExpiredTime = ExpiredTime;
    voucher.Description = Description;
    voucher.Image = Image;
    voucher.RemainQuantity = RemainQuantity;

    await voucher.save();

    res.json({
      message: "Voucher updated successfully and conditions are updated",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//---------------------------------------------------------delete voucher
const deleteVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const voucher = await VoucherDB.findByIdAndDelete(_id);

    if (!voucher) {
      return res.status(404).json({ message: " VoucherDB not found" });
    }
    res.json({ message: " VoucherDB deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//---------------------------------------get voucher by admin voucher lấy tất cả voucher để xem bởi admin
const getVoucherByAdmin = async (req, res) => {
  try {
    const vouchersWithDetails = await VoucherDB.aggregate([
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);

    if (vouchersWithDetails.length === 0) {
      return res.status(404).json({ message: "No vouchers found" });
    }

    res.json(vouchersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//----------------------------------------------get voucher by partner ở trên web của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    const Partner_ID = req.decoded._id;
    const voucher = await VoucherDB.aggregate([
      { $match: { Partner_ID: Partner_ID } },
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//---------------------------------------updateState
const updateState = async (req, res) => {
  try {
    const { _id } = req.params;

    const voucher = await VoucherDB.findById(_id);
    if (!voucher) {
      return res
        .status(404)
        .json({ message: "VoucherDB not found to update state" });
    }
    if (voucher.RemainQuantity == 0) {
      voucher.States = "disable";
    } else {
      voucher.States = voucher.States === "enable" ? "disable" : "enable";
    }

    await voucher.save();

    res.status(200).json({ message: "State updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createVoucherbyAdmin,
  createVoucherbyPartner,
  updateVoucher,
  deleteVoucher,
  getVoucherByAdmin,
  getvoucherManagerbyPartner,
  DetailVoucher,
  updateState,
};
