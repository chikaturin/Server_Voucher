const VoucherDB = require("../Schema/schema").Voucher;
const CounterVoucher = require("../Schema/schema").counterVoucher;
const ConditionDB = require("../Schema/schema").Condition;
const CounterCondition = require("../Schema/schema").counterCondition;

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

    const voucher = new VoucherDB({
      _id: idVoucher,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
    });
    await voucher.save();

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

      const newCondition = new ConditionDB({
        _id: idCondition,
        Voucher_ID: idVoucher,
        MinValue,
        MaxValue,
        PercentDiscount,
      });
      await newCondition.save();
    }

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
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
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
    } = req.body;

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

    const counterVoucher = await CounterVoucher.findOneAndUpdate(
      { _id: "GenaralVoucher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const States = "enable";
    const Partner_ID = req.decoded._id;

    const voucher = new VoucherDB({
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
      Partner_ID,
    });

    await voucher.save();

    for (const condition of Conditions) {
      const { MinValue, MaxValue, PercentDiscount } = condition;

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

      const Condition = new ConditionDB({
        _id: _id,
        MinValue,
        MaxValue,
        PercentDiscount,
      });

      await Condition.save();
    }

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const DetailVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const voucher = await VoucherDB.findById(_id);
    if (!voucher) {
      return res.status(404).json({ message: "VoucherDB not found" });
    }
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
    } = req.body;

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

    for (const condition of Conditions) {
      const {
        _id: conditionId,
        MinValue,
        MaxValue,
        PercentDiscount,
      } = condition;

      const existingCondition = await Condition.findById(conditionId);
      if (!existingCondition) {
        return res
          .status(404)
          .json({ message: `Condition with ID ${conditionId} not found` });
      }

      if (PercentDiscount < 0 || PercentDiscount > 100) {
        return res
          .status(400)
          .json({ message: "PercentDiscount must be between 0 and 100" });
      }
      if (MinValue < 0 || MaxValue < 0) {
        return res
          .status(400)
          .json({ message: "MinValue and MaxValue must be greater than 0" });
      }

      existingCondition.MinValue = MinValue;
      existingCondition.MaxValue = MaxValue;
      existingCondition.PercentDiscount = PercentDiscount;

      await existingCondition.save();
    }

    res.json({
      message: "Voucher updated successfully and conditions are updated",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete voucher
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

//get voucher by admin voucher lấy tất cả voucher để xem bởi admin
const getVoucherByAdmin = async (req, res) => {
  try {
    const vouchersWithConditions = await VoucherDB.aggregate([
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
    ]);

    if (vouchersWithConditions.length === 0) {
      return res.status(404).json({ message: "No vouchers found" });
    }

    res.json(vouchersWithConditions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get voucher by partner ở trên web của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    const Partner_ID = req.decoded._id;
    const voucher = await VoucherDB.find({
      Partner_ID: Partner_ID,
    });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
