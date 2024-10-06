const HistoryDB = require("../Schema/schema").History;
const CounterHistoryDB = require("../Schema/schema").counterHistory;

const createHistory = async (req, res) => {
  try {
    const { Voucher_ID, CusID, TotalDiscount, Date } = req.body;

    let historyCounter = await CounterHistoryDB.findOneAndUpdate(
      { _id: "Statistical" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const _id = `HIS${historyCounter.seq}`;
    const history = new HistoryDB({
      _id,
      Voucher_ID,
      CusID,
      TotalDiscount,
      Date,
    });
    await history.save();

    res.status(201).json({ message: "History created successfully", _id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Statistical_Voucher = async (req, res) => {
  const history = await HistoryDB.find();
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  res.json(history);
};

const Statistical_VoucherFindPartner_Service = async (req, res) => {
  try {
    const Statistical = await HistoryDB.aggregate([
      {
        $lookup: {
          from: "vouchers",
          localField: "Voucher_ID",
          foreignField: "_id",
          as: "vouchers",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "Voucher_ID",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);
    res.json(Statistical);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Staitstical_PartnerService = async (req, res) => {
  const { Partner_ID } = req.decoded._id;
  const history = await HistoryDB.find({ Partner_ID });
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  res.json(history);
};

const StatisticalSort = async (req, res) => {
  try {
    const { month, year } = req.body;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const history = await HistoryDB.find({
      Date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (!history || history.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử cho tháng và năm này" });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createHistory,
  Statistical_Voucher,
  Staitstical_PartnerService,
  StatisticalSort,
  Statistical_VoucherFindPartner_Service,
};
