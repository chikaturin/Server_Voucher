const Voucher = require("../Schema/schema").Voucher;
const History = require("../Schema/schema").History;
const HaveVoucher = require("../Schema/schema").HaveVoucher;
const Condition = require("../Schema/schema").Condition;

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

    res.status(200).json({ priceDiscount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const UsedVoucher = async (req, res) => {
  try {
    const { Product_ID } = req.params;
    const noteVoucher = await NoteVoucher.findOne({ Product_ID });
    if (!noteVoucher) {
      return res.status(404).json({ message: "NoteVoucher not found" });
    }

    const history = new History({
      Voucher_ID: noteVoucher.Voucher_ID,
      Product_ID: noteVoucher.Product_ID,
      AmountUsed: noteVoucher.Price,
      Date: new Date(),
    });
    await history.save();

    res.status(200).json({ message: "Used Voucher successfully" });

    //save in history
    const DeletenoteVoucher = await NoteVoucher.findOneAndDelete({
      Product_ID,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const UseVoucher = async (req, res) => {
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

module.exports = { CalculateVoucher, UsedVoucher, UseVoucher };
