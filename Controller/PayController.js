const Voucher = require("../Schema/schema").Voucher;
const History = require("../Schema/schema").History;
const HaveVoucher = require("../Schema/schema").HaveVoucher;
const Condition = require("../Schema/schema").Condition;
const CounterHistory = require("../Schema/schema").counterHistory;

const CalculateVoucher = async (req, res) => {
  try {
    const { _id, Price } = req.body;

    const voucher = await Voucher.findOne({ _id });
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const conditions = await Condition.find({ Voucher_ID: voucher._id });

    if (!conditions.length) {
      return res
        .status(404)
        .json({ message: "No conditions found for this voucher" });
    }

    let max = 0;
    let selectedCondition = null;

    for (const condition of conditions) {
      if (condition.MinValue > max && condition.MinValue <= Price) {
        max = condition.MinValue;
        selectedCondition = condition;
      }
    }

    if (!selectedCondition) {
      return res.status(404).json({ message: "No applicable condition found" });
    }

    let priceDiscount = 0;
    const discount = (selectedCondition.PercentDiscount * Price) / 100;

    if (discount < selectedCondition.MaxValue) {
      priceDiscount = discount;
    } else {
      priceDiscount = selectedCondition.MaxValue;
    }

    res.status(200).json(priceDiscount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const ApplyVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const { CusID, TotalDiscount } = req.body;
    const voucher = await Voucher.findByIdAndUpdate(
      _id,
      {
        $inc: { RemainQuantity: -1, AmountUsed: 1 },
      },
      { new: true }
    );
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (voucher.RemainQuantity < 1) {
      await Voucher.findByIdAndUpdate(_id, { $set: { States: "disable" } });
    }

    const counterID = await CounterHistory.findOneAndUpdate(
      { _id: "Statistical" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const _idhis = `HIS${counterID.seq}`;

    const history = new History({
      _id: _idhis,
      Voucher_ID: _id,
      CusID,
      TotalDiscount,
      Date: new Date(),
    });
    await history.save();

    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getVoucherByCus = async (req, res) => {
  try {
    const { Service_ID, Partner_ID, Price } = req.body;
    const havevoucher = await HaveVoucher.find({ Service_ID });
    if (!havevoucher.length) {
      return res.status(404).json({ message: "HaveVoucher not found" });
    }

    const voucherIDs = havevoucher.map((v) => v.Voucher_ID);

    const voucher = await Voucher.aggregate([
      {
        $match: {
          _id: { $in: voucherIDs },
          States: "enable",
          $or: [{ Partner_ID }, { Partner_ID: null }],
          MinCondition: { $lte: Price },
        },
      },
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
    ]);

    if (!voucher.length) {
      return res
        .status(404)
        .json({ message: "Voucher or conditions not found" });
    }

    res.status(200).json({ voucher });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { CalculateVoucher, ApplyVoucher, getVoucherByCus };
