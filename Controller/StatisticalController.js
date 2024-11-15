const HistoryDB = require("../Schema/schema").History;
const CounterHistoryDB = require("../Schema/schema").counterHistory;
const redisClient = require("../Middleware/redisClient");
const { Voucher } = require("../Schema/schema");
const ensureRedisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

let timeredis;

// //xoá
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

const Statistical_ID = async (req, res) => {
  try {
    await ensureRedisConnection();
    const { _id, month, year } = req.params;
    const key = `Statistical_ID:${_id}:${month}:${year}`;
    const cacheStatistical = await redisClient.get(key);
    if (cacheStatistical) {
      return res.status(200).json(JSON.parse(cacheStatistical));
    }

    const history = await HistoryDB.find({
      Voucher_ID: _id,
      $expr: {
        $and: [
          { $eq: [{ $month: "$Date" }, Number(month)] },
          { $eq: [{ $year: "$Date" }, Number(year)] },
        ],
      },
    });

    const voucher = await Voucher.aggregate([
      {
        $match: {
          _id,
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

    if (!history.length) {
      return res.status(404).json({ message: "History not found" });
    }

    if (!voucher.length) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const data = {
      history,
      voucher,
    };

    await redisClient.setEx(key, 3600, JSON.stringify(data));

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// //xoá
// const HistoryCus = async (req, res) => {
//   await ensureRedisConnection();
//   const { CusID } = req.decoded._id;
//   const cacheKey = `HistoryCus_${CusID}`;
//   const cacheHistory = await redisClient.get(cacheKey);
//   if (cacheHistory) {
//     return res.status(200).json(JSON.parse(cacheHistory));
//   }

//   const history = await HistoryDB.find({ CusID });
//   if (!history) {
//     return res.status(404).json({ message: "History not found" });
//   }
//   await redisClient.set(cacheKey, JSON.stringify(history));
//   res.json(history);
// };

const Statistical_VoucherAdmin = async (req, res) => {
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

const Statistical_PartnerService = async (req, res) => {
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
      {
        $match: {
          "vouchers.Partner_ID": Partner_ID,
        },
      },
    ]);

    res.status(200).json(Statistical);
  } catch (error) {
    console.error("Error in Statistical_PartnerService:", error);
    res.status(500).json({ message: error.message });
  }
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

// createHistory,
// Statistical_Voucher,
// HistoryCus,
module.exports = {
  createHistory,
  Statistical_ID,
  Statistical_PartnerService,
  StatisticalSort,
  Statistical_VoucherAdmin,
};
